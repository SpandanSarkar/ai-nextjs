const memoryStore = {
  users: [],

  addUser(user) {
    this.users.push(user);
  },

  findUserByEmail(email) {
    return this.users.find(user => user.email === email);
  },

  validateUser(email, password) {
    const user = this.findUserByEmail(email);
    return user && user.password === password;
  }
};

export default memoryStore;