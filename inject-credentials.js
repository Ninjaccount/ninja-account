/*
var toInject =
{
email : string,
password : string
}
*/

// order is important, the last matching will be the final value of the input
var filters = [
  {
    key: 'name',
    matchers: [
      input => { return $(input).attr("id") && $(input).attr("id").indexOf("name") != -1; },
      input => { return $(input).attr("name") && $(input).attr("name").indexOf("name") != -1; }
    ]
  },
  {
    key: 'firstname',
    matchers: [
      input => { return $(input).attr("id") && $(input).attr("id").toLowerCase().indexOf("firstname") != -1; },
      input => { return $(input).attr("name") && $(input).attr("name").indexOf("firstname") != -1; }
    ]
  },
  {
    key: 'lastname',
    matchers: [
      input => { return $(input).attr("id") && $(input).attr("id").indexOf("lastname") != -1; },
      input => { return $(input).attr("name") && $(input).attr("name").indexOf("lastname") != -1; }
    ]
  },
  {
    key: 'email',
    matchers : [
      input => { return $(input).attr("name") && $(input).attr("name").indexOf("email") != -1; },
      input => { return $(input).attr("name") && $(input).attr("name").indexOf("e-mail") != -1; }
    ]
  },
  {
    key: 'password',
    matchers: [
      input => $(input).attr("type") && $(input).attr("type") == "password"
    ]
  }
];

chrome.runtime.onMessage.addListener(function listen(messageJson, sender, sendResponse)
{
  var toInject = JSON.parse(messageJson);
  var result = [];
  var inputs = $("input");
  console.log('Dom CONTEONTEO NEZJRLDSLKMEHJ ')
  _(filters)
  .filter(filter => toInject[filter.key] != undefined)
  .forEach(filter => {
    console.log("key: ", filter.key);
    result.push({ key: filter.key, injected: false, value: toInject[filter.key]});
    var input = _(inputs)
    .filter(input => _.some(filter.matchers, matcher => matcher(input)))
    .forEach(input => {
      result[ result.length - 1 ].injected = true;
      console.log("Found input", input);
      input.value = toInject[filter.key];
      $(input).css('background-color', '#80FFD9');
      $(input).css('color', '#222222');
    });
  });


  console.log( toInject );

  sendResponse(JSON.stringify(result));
});

"Initialized";
