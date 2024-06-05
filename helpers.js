//  function to get user by their email.
const getUserByEmail = (email, database)=>{
  for (const userID in database) {
    let user = database[userID];
    if (user.email === email)
      return user;
  }
  return null;  //  if email does not exits, return null.
};
module.exports = {getUserByEmail};