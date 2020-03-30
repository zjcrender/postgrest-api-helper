import Api from './Api'

class PGHelper {
  constructor(axiosInstance) {
    this.axiosInstance = axiosInstance
  }

  request(config) {
    return new Api(this.axiosInstance, config)
  }
};

[ 'get', 'delete', 'head', 'options', 'post', 'put', 'patch' ].forEach(method => {
  PGHelper.prototype[method] = function (endpoint) {
    return this.request({
      url: endpoint,
      method
    })
  }
});

export * from './Api'
export { PGHelper }
export default PGHelper
