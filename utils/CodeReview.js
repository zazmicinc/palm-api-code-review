const https = require("https");

async function codeReview(content, endpoint) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      content: content,
    });

    const options = {
      hostname: process.env.HOSTNAME,
      port: process.env.PORT,
      path: process.env.PATH,
      method: process.env.METHOD,
      headers: {
        "Content-Type": "application/json",
      },
    };

    console.log("Generating code review...");
    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        // Handle the API response here
        const parsedObject = JSON.parse(data);
        if (parsedObject === undefined) {
          console.log("...Error generating code review");
          reject("Error generating code review");
        } else {
          console.log("...Done");
          let res = parsedObject;
          resolve(res);
        }
      });
    });

    req.on("error", (error) => {
      // Handle any errors that occur during the API call
      console.error("Error calling API:", error.message);
      reject(error); // Reject the Promise with the error
    });

    req.write(postData);
    req.end();
  });
}

module.exports = {
  codeReview
};
