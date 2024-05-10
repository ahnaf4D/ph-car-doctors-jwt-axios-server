# Ph Car Doctors Server with JWT Implementation Guide

Welcome to the server-side repository of Ph Car Doctors! Below, you'll find a step-by-step guide to fortify your API's security using JSON Web Tokens (JWT). These simple steps will help you streamline your authentication process and enhance your project's defenses against unauthorized access.

## [Client Side Repository](https://github.com/ahnaf4D/ph-car-doctors-jwt-axios-client)

## Ensuring API Security

Securing sensitive user data is our top priority. Let's ensure only authorized individuals can access your API:

1. **Define Access Control**: Clearly define who should and shouldn't have access to your API.
2. **Implement Token-Based Authentication**: Use two types of tokens per user - an access token and a refresh token.
3. **Understanding Token Structure**:
   - Access Token: Contains essential user information and remains valid for a shorter duration.
   - Refresh Token: Regenerates an expired access token, providing continuous access.
4. **Logout Management**: Ensure users are securely logged out if a refresh token becomes invalid.

## Key Concepts

1. **Token Generation**: Use trusted libraries like [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) to generate secure tokens.
2. **Token Handling**:
   - Client-Side: Store tokens securely in cookies (recommended), local storage, Redux store, or similar client-side storage methods.
   - Server-Side: Verify tokens upon receipt from the client to guarantee authenticity.
3. **Token Transmission**: Always include the token in requests sent from the client to the server.
4. **Server-Side Validation**: Validate tokens on the server to ensure they're genuine and untampered before serving data to the client.

## JWT Simplified Workflow

JSON Web Tokens offer a straightforward solution for authentication and authorization. Here's a simplified breakdown of the JWT workflow:

1. **JWT Introduction**: JSON Web Token - a concise method for securely exchanging information.
2. **Token Creation**: Generate tokens on the server containing user-specific data.
   ```javascript
   // Token creation example
   app.post('/auth/jwt', (req, res) => {
     const user = req.body;
     const token = jwt.sign(user, process.env.TOKEN, { expiresIn: '1h' });
     res
       .cookie('token', token, {
         httpOnly: true,
         secure: true,
         sameSite: true,
       })
       .send({ success: true });
   });
   ```
3. **CORS Policy Setup**: Configure CORS on the server.
   ```javascript
   // CORS setup example
   app.use(
     cors({
       origin: ['http://localhost:5173', 'http://localhost:5174'],
       credentials: true,
     })
   );
   ```
4. **Browser Cookie Settings**: Store token in browser cookies with specific settings.
5. **Token Distribution**: After successful authentication, send the token to the client.
6. **Client-Side Storage**: Securely store the token on the client side using recommended methods.
7. **Token Inclusion**: Attach the token to each request sent to the server.
8. **Server-Side Validation**: Validate the token on the server before serving requested data to the client.

By implementing JWT authentication, you enhance your application's security, ensuring only authenticated users can access protected resources. With these best practices and core concepts in mind, you can create a robust authentication system for your project.

## Clear Token When User Logout

Server Side Code:

```javascript
// Server-side logout
app.post('/auth/logout', async (req, res) => {
  const user = req.body;
  console.log(`user logout`);
  res.clearCookie('token', { maxAge: 0 }).send({ success: true });
});
```

Client Side Code:

```javascript
// Client-side logout
const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
  const userEmail = currentUser?.email || user?.email;
  const loggedUser = { email: userEmail };
  setUser(currentUser);
  if (currentUser) {
    axios
      .post('http://localhost:3000/auth/jwt', loggedUser, {
        withCredentials: true,
      })
      .then((res) => {
        console.log('token response', res.data);
      });
  } else {
    axios
      .post(`http://localhost:3000/auth/logout`, loggedUser, {
        withCredentials: true,
      })
      .then((res) => console.log(res.data));
  }
});
return () => unsubscribe();
```

Certainly! Let's integrate the provided information into the README.md in a more beginner-friendly format:

---

## Secure API Calls

To ensure secure communication between your client-side and server-side applications, follow these steps:

1. **Server-Side Setup**:

   - Install and use [Cookie Parser](https://expressjs.com/en/resources/middleware/cookie-parser.html) as middleware on the server side.
   - This enables easy access to cookies sent by the client in HTTP requests.
   - Example: `const cookieParser = require('cookie-parser'); app.use(cookieParser());`

2. **Accessing Cookies on the Server**:

   - Once Cookie Parser middleware is set up, you can access cookies using `req.cookies` in your Express route handlers.
   - This allows you to retrieve tokens or other data stored in cookies sent by the client.

3. **Client-Side API Calls**:
   - When making API calls from the client side, ensure that cookies are included in the request for authentication purposes.
   - If you're using Axios:
     ```javascript
     axios.post('http://your-api-endpoint', data, {
       withCredentials: true,
     });
     ```
   - If you're using the Fetch API:
     ```javascript
     fetch('http://your-api-endpoint', {
       method: 'POST',
       credentials: 'include',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify(data),
     });
     ```

By implementing these steps, you establish a secure connection between your client-side and server-side applications, ensuring that authenticated users can access protected resources while maintaining the integrity and confidentiality of your data.
