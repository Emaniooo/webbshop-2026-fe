
// export function getBaseUrl() {
//   if (window.location.hostname.includes("localhost")) {
//     return "http://localhost:3000/";
//   }
//   // TODO: Add deployed backend URL
//   return "https://your-backend.vercel.app/";
// }

/* export function getBaseUrl() {
  if (window.location.hostname.includes("localhost") && false ) {  */
    // Kommentera ut för att komma åt lokal server igen
 /*    return "http://localhost:3000/";
  }
  return "https://plottwistgrupp11.vercel.app/"; 
}
 */
/* export function getBaseUrl() {
  const host = window.location.hostname;

  if (host === "localhost" || host === "127.0.0.1") {
    return "http://localhost:3000/";
  }

  return "https://plottwistgrupp11.vercel.app/";
} */

  export function getBaseUrl() {
  return "https://plottwistgrupp11.vercel.app/";
}