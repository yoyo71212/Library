// Function returns true if book was added, false otherwise

console.log('Adding book to user');

const button = document.getElementById('readlist');
button.addEventListener('click', function(e) {
    console.log(document.documentURI)
    console.log('button was clicked');

//   fetch('/clicked', {method: 'POST'})
//     .then(function(res) {
//       if(res.ok) {
//         console.log('Click was recorded');
//         return;
//       }
//       throw new Error('Request failed.');
//     })
//     .catch(function(error) {
//       console.log(error);
//     });
});


// function addUserReadlist(username, bookId) {
//     // Fetch user from DB
//     const Users = JSON.parse(fs.readFileSync(`../localDB/users.json`))

//     if (Users[username] == undefined) return false;

//     // Modify user
//     Users[username].readList.push(bookId);

//     // Save modified DB
//     fs.writeFile(`../localDB/users.json`, JSON.stringify(Users), 'utf8', (err) => {
//         if (err) {
//             console.log(err);
//             return false;
//         } else {
//             console.log(`Added: ${bookId} To: ${username}'s read list`);
//             return true;
//         }
//     })
// }