const ServerUrl = {
  baseUrl() {
    return "http://localhost:3000/api/";
  },
  getUrl(page) {
    return this.baseUrl() + page;
  }
};

export default ServerUrl;