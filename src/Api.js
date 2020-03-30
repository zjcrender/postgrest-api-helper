import Params from "./Params";

const SIMPLE_OPERATOR = [ 'eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'like', 'ilike', 'in', 'is', 'cs', 'cd' ];
const GROUP_OPERATOR = [ 'and', 'or' ];

const defaultFormat = {
  like: '*%v*', ilike: '*%v*', in: '(%v)',
}

class Api {
  constructor(axiosInstance, requestConfig) {
    this.axiosInstance = axiosInstance;
    this.requestConfig = requestConfig;

    this.requestConfig.headers = this.requestConfig.headers || {};
    const [ endpoint, searchParams ] = this.requestConfig.url.split('?');
    this.requestConfig.url = endpoint;
    this.params = new Params(searchParams)

    this.queries = {};
    this.not_mode = false;
  }

  setQueries(queries) {
    this.queries = queries;
    return this;
  }

  setBody(data) {
    this.requestConfig.data = data;
    return this;
  }

  addHeader(key, value) {
    this.requestConfig.headers[key] = value;
    return this;
  }

  removeHeader(key) {
    delete this.requestConfig.headers[key];
    return this;
  }

  // api.order('name', true)
  // api.order('name', 'age.desc', 'gender')
  order(...args) {
    const [ key, ascending, nullsfirst ] = args;

    const ascendingType = typeof ascending
    const nullsfirstType = typeof ascending
    if (ascendingType === 'boolean' || nullsfirstType === 'boolean') {

      if (typeof key !== 'string')
        throw new TypeError('The key is not a string!');
      if (ascendingType !== 'undefined' && ascendingType !== 'boolean')
        throw new TypeError('The ascending should be boolean or omitted!');
      if (nullsfirstType !== 'undefined' && nullsfirstType !== 'boolean')
        throw new TypeError('The nullsfirst should be boolean or omitted!');

      let rule = key
      if (ascendingType === 'boolean' && !ascending) rule += '.desc';
      if (ascendingType === 'boolean') rule += nullsfirst ? '.nullsfirst' : '.nullslast';
      this.params.append('order', rule);
    } else {
      const error = args.some(rule => typeof rule !== 'string');
      if (error) throw new TypeError('Arguement error, should be all string!')
      args.forEach(rule => this.params.append('order', rule))
    }
    return this;
  }

  select(...args) {
    args.forEach(key => this.params.append('select', key));
    return this;
  }

  pagination(pageIndex, pageSize = 10, count = false) {
    this.requestConfig.pagination = { pageIndex, pageSize };
    this.addHeader('Range-Unit', 'items');
    this.addHeader('Range', `${ (pageIndex - 1) * pageSize }-${ pageIndex * pageSize - 1 }`);

    if (count) {
      this.addHeader('Prefer', 'count=exact');
    } else if (this.requestConfig.headers.Prefer === 'count=exact') {
      this.removeHeader('Prefer');
    }
    return this;
  }

  get not() {
    this.not_mode = !this.not_mode
    return this
  }

  _getSimpleSearchKeyAndValue(operator, args, notMode = false) {
    const finalOperator = ((notMode || this.not_mode) ? 'not.' : '') + operator;
    this.not_mode && (this.not_mode = false)

    return args.map(rule => {
      let [ , searchKey, queryKey, format ] = /^(.*?)(?:\:(.*?))?(?:\|(.*?))?$/.exec(rule);
      format = format || defaultFormat[operator] || '%v';
      queryKey = queryKey || searchKey;

      // eg: ['name', 'like.*bob*']
      return [ searchKey, `${ finalOperator }.${ format.replace('%v', this.queries[queryKey]) }` ]
    })
  }

  _getGroupSearchKeyAndValue(operator, args, notMode = false) {
    const value = this._withResendHandler(args);
    const finalOperator = ((notMode || this.not_mode) ? 'not.' : '') + operator;
    this.not_mode && (this.not_mode = false)
    return [ finalOperator, `(${ value })` ]
  }

  _withResendHandler(args) {
    return args.map(arg => {
      if (Array.isArray(arg)) {
        const _operator = arg[0];
        if (SIMPLE_OPERATOR.includes(_operator)) {
          return this._getSimpleSearchKeyAndValue.apply(this, arg)
            .map(([ key, value ]) => `${ key }.${ value }`)
            .join(',')
        } else if (GROUP_OPERATOR.includes(_operator)) {
          return this._getGroupSearchKeyAndValue.apply(this, arg).join('');
        }

        throw new TypeError('Unknow operator ' + _operator)
      }
      return arg;
    })
  }

  end() {
    this.requestConfig.url += `?${ this.params.toString() }`;
    return this.axiosInstance(this.requestConfig)
      .then(response => [ null, response ])
      .catch(error => [ error, null ])
  }

  then(resolve) {
    this.end().then(resolve);
  }
};

const quickApi = {
  not: {}
}

SIMPLE_OPERATOR.forEach(operator => {
  Api.prototype[operator] = function (...args) {
    const error = args.some(rule => typeof rule !== 'string');
    if (error) throw new TypeError('Arguement error, should be all string!')

    this
      ._getSimpleSearchKeyAndValue(operator, args)
      .forEach(([ key, value ]) => this.params.append(key, value))
    return this
  }
  quickApi[operator] = function (...args) {
    return [ operator, args ]
  }
  quickApi.not[operator] = function (...args) {
    return [ operator, args, true ]
  }
});

GROUP_OPERATOR.forEach(operator => {
  Api.prototype[operator] = function (...args) {
    const [ key, value ] = this._getGroupSearchKeyAndValue(operator, this._withResendHandler(args));
    this.params.append(key, value);

    return this;
  }
  quickApi[operator] = function (...args) {
    return [ operator, args ]
  }
  quickApi.not[operator] = function (...args) {
    return [ operator, args, true ]
  }
})

export default Api
export const {
  not,
  eq, neq, gt, gte, lt, lte, like, ilike, in: _in, is, cs, cd,
  and, or
} = quickApi
