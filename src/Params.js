class Params {

  constructor(queries) {
    this.params = {};
    this.parseQueries(queries);
  }

  /**
   * @description 解析URLSearchParams为SearchParams
   * @param {String} queries - URLSearchParams
   * */
  parseQueries(queries) {
    const p = /([^&]+)=([^&]*)/g;
    while (p.exec(queries)) {
      this.append(
        decodeURIComponent(RegExp.$1),
        decodeURIComponent(RegExp.$2)
      );
    }
  }

  /**
   * @description 插入一个指定的键/值对作为新的搜索参数
   * @param {String} key - 键名
   * @param {String} value - 搜索参数
   * */
  append(key, value) {
    if (!key || !value) throw new Error('key and value both required');
    const ek = encodeURI(key);
    const ev = encodeURIComponent(value);
    this.params[ek] = this.params[ek] || [];
    this.params[ek].indexOf(ev) === -1 && this.params[ek].push(ev);
  }

  /**
   * @description 删除指定名值的参数或指定名称的所有搜索参数
   * @param {String} key - 键名
   * @param {String} [value] - 搜索参数
   * */
  remove(key, value) {
    if (value) {
      const index = this.params[key].indexOf(value);
      index !== -1 && this.params[key].splice(index, 1);
    } else {
      delete this.params[key];
    }
  }

  /**
   * @description 返回搜索参数组成的字符串
   * @return {String} - 搜索参数组成的字符串
   * */
  toString() {
    const search = [];

    Object.entries(this.params).forEach(([key, values]) => {
      // eg: [ 'age', [ 'gt.18', 'lt.30' ] ]
      // eg: [ 'select', [ '*', 'table(*)' ] ]
      // eg: [ 'and', [ '(name.like.*render*,age.not.gte.30)' ] ]

      if (key === 'order' || key === 'select') { // 特殊处理order、select
        search.push(`${key}=${this.params[key].join(',')}`)
      } else {
        values.forEach(value => {
          search.push(`${key}=${value}`)
        })
      }

    })

    return search.join('&');
  }

}

export default Params
