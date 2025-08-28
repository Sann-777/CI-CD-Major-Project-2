exports.contactUsEmail = (email, firstname, lastname, message, phoneNo) => {
  return `<!DOCTYPE html>
  <html>
  
  <head>
      <meta charset="UTF-8">
      <title>Contact Form Received</title>
      <style>
          body {
              background-color: #ffffff;
              font-family: Arial, sans-serif;
              font-size: 16px;
              line-height: 1.4;
              color: #333333;
              margin: 0;
              padding: 0;
          }
  
          .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              text-align: center;
          }
  
          .logo {
              max-width: 200px;
              margin-bottom: 20px;
          }
  
          .message {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 20px;
          }
  
          .body {
              font-size: 16px;
              margin-bottom: 20px;
          }
  
          .cta {
              display: inline-block;
              padding: 10px 20px;
              background-color: #FFD60A;
              color: #000000;
              text-decoration: none;
              border-radius: 5px;
              font-size: 16px;
              font-weight: bold;
              margin-top: 20px;
          }
  
          .support {
              font-size: 14px;
              color: #999999;
              margin-top: 20px;
          }
  
          .highlight {
              font-weight: bold;
          }
      </style>
  
  </head>
  
  <body>
      <div class="container">
          <div class="message">Contact Form Submission Received</div>
          <div class="body">
              <p>You have received a new contact form submission. Here are the details:</p>
              <p><span class="highlight">Name:</span> ${firstname} ${lastname}</p>
              <p><span class="highlight">Email:</span> ${email}</p>
              ${phoneNo ? `<p><span class="highlight">Phone:</span> ${phoneNo}</p>` : ''}
              <p><span class="highlight">Message:</span></p>
              <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; text-align: left; margin: 15px 0;">
                  ${message}
              </div>
          </div>
          <div class="support">Please respond to this inquiry as soon as possible.</div>
      </div>
  </body>
  
  </html>`;
};
