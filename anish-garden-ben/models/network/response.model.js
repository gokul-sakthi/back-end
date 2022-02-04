function Response(message = "", status = "", payload = null, error = null) {
  this.message = message;
  this.status = status;
  this.payload = payload;
  this.error = error;
}

Response.prototype.getMessage = function () {
  return this.message;
};
Response.prototype.getStatus = function () {
  return this.status;
};
Response.prototype.getPaylod = function () {
  return this.payload;
};
Response.prototype.getError = function () {
  return this.error;
};

Response.prototype.setMessage = function (message) {
  this.message = message;
};
Response.prototype.setStatus = function (status) {
  this.status = status;
};
Response.prototype.setPaylod = function (payload) {
  this.payload = payload;
};
Response.prototype.setError = function (error) {
  this.error = error;
};

module.exports = Response;
