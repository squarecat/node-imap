export const html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html
  xmlns="http://www.w3.org/1999/xhtml"
  style="font-family: Helvetica Neue, Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"
>
  <head>
    <meta name="viewport" content="width=device-width" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Quick Mail</title>
    <style type="text/css">
      a {
        color: #0166d6;
      }
      body {
        -webkit-font-smoothing: antialiased;
        -webkit-text-size-adjust: none;
        width: 100% !important;
        height: 100%;
        line-height: 1.6;
      }
    </style>
  </head>
  <body
    itemscope
    itemtype="http://schema.org/EmailMessage"
    style="font-family: Helvetica Neue, Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 14px; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: none; width: 100% !important; height: 100%; line-height: 1.6; margin: 0;"
  >
    <table
      class="body-wrap"
      style="font-family: Helvetica Neue, Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 14px; width: 100%; margin: 0;"
    >
      <tr
        style="font-family: Helvetica Neue, Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"
      >
        <td
          class="container"
          width="560"
          style="font-family: Helvetica Neue, Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; display: block !important; max-width: 560px !important; clear: both !important;margin: 40px"
          valign="top"
        >
          <p>Hi,</p>

          <p>This is a test!</p>

          <p>
            I look forward to feedback from you.<br />
            Thanks.
          </p>


          <p><a href="%mailing_list_unsubscribe_url%">Unsubscribe</a></p>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

export const text = `Hi,
This is a test!

I look forward to feedback from you.
Thanks.

%mailing_list_unsubscribe_url%`;
