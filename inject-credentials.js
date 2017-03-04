/*
var toInject =
{
email : string,
password : string
}
*/

function attributeContains(input, attrName, value) {
  return $(input).attr(attrName) && $(input).attr(attrName).toLowerCase().indexOf(value.toLowerCase()) != -1;
}

function attributeEquals(input, attrName, value) {
  return $(input).attr(attrName) && $(input).attr(attrName).toLowerCase() === value.toLowerCase();
}


const idMatch = value => input => attributeContains(input, 'id', value);
const nameMatch = value => input => attributeContains(input, 'name', value);
const placeholderMatch = value => input => attributeContains(input, 'placeholder', value);
const typeMatch = value => input => attributeEquals(input, 'type', value);

const defaultMatchers = value => [
  placeholderMatch(value),
  idMatch(value),
  nameMatch(value)
]

// order is important, the last matching will be the final value of the input
var filters = [
  {
    key: 'address',
    matchers: defaultMatchers('address')
  },
  {
    key: 'zipcode',
    matchers: [
      ...defaultMatchers('zip'),
      ...defaultMatchers('postal')
    ]
  },
  {
    key: 'state',
    matchers: [
      ...defaultMatchers('state'),
      ...defaultMatchers('region'),
      ...defaultMatchers('province'),
    ]
  },
  {
    key: 'city',
    matchers: defaultMatchers('city')
  },
  {
    key: 'country',
    matchers: defaultMatchers('country')
  },
  {
    key: 'phone',
    matchers: defaultMatchers('phone')
  },
  {
    key: 'name',
    matchers: defaultMatchers('name')
  },
  {
    key: 'firstname',
    matchers: defaultMatchers('firstname')
  },
  {
    key: 'lastname',
    matchers:  defaultMatchers('lastname')
  },
  {
    key: 'email',
    matchers: [
      ...defaultMatchers('email'),
      ...defaultMatchers('e-mail')
    ]
  },
  {
    key: 'password',
    matchers: [
      typeMatch('password')
    ]
  },
];

chrome.runtime.onMessage.addListener(function listen(messageJson, sender, sendResponse) {
  var toInject = JSON.parse(messageJson);
  var result = [];
  var inputs = $("input");
  console.log('Dom CONTEONTEO NEZJRLDSLKMEHJ ')
  _(filters)
    .filter(filter => toInject[filter.key] != undefined)
    .forEach(filter => {
      console.log("key: ", filter.key);
      result.push({ key: filter.key, injected: false, value: toInject[filter.key] });
      var input = _(inputs)
        .filter(input => _.some(filter.matchers, matcher => matcher(input)))
        .forEach(input => {
          result[result.length - 1].injected = true;
          console.log("Found input", input);
          input.value = toInject[filter.key];
          $(input).css('background-color', '#80FFD9');
          $(input).css('color', '#222222');
        });
    });


  console.log(toInject);

  sendResponse(JSON.stringify(result));
});

"Initialized";
