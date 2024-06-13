//  function to get user by their email.
const getUserByEmail = (email, database)=>{
  for (const userID in database) {
    let user = database[userID];
    if (user.email === email)
      return user;
  }
  return null;  //  if email does not exits, return null.
};

//  Generate a random strings
function generateRandomString() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

module.exports = {getUserByEmail, generateRandomString};