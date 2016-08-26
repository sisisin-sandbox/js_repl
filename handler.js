'use strict';
console.log('Loading function');

const exec = require('child_process').exec;

exports.handler = function (event, context) {
  // return context.done(null, { text: JSON.stringify(event.text.body) });  
  const params = decodeBody(event.body);
  const statement = getStatement(params);

  const exe = () => {
    exec(`node -p '${statement}'`, (err, stdout, stderr) => {
      if (err) {
        return context.done(null, { text: buildText(event.body, statement, err) });
      }
      if (stderr) {
        return context.done(null, { text: buildText(event.body, statement, stderr) });
      }
      context.done(null, { text: buildText(event.body, statement, stdout) });
    });
  };
  exe();
//   const result = evaluator(statement);
//   context.done(null, { text: buildText(event.body, statement, result) });
};

function buildText(body, statement, text) {
  return `statement: ${statement}\n` +
    '```\n' + text + '```\n'
    // + `body: ${body}`;
}
function decodeBody(body) {
  return body.split('&').map(param => {
    const keyValue = param.split('=');
    return { key: keyValue[0], value: keyValue[1] };
  });
}
function getStatement(params) {
  const statement = params.filter(p => p.key === 'text')[0].value.replace(/\+/g, ' ').substring(5);
  return unescape(statement);
}
function evaluator(text) {
  let result = '';
  text.split('\n').forEach(v => {
    result += `> ${v} \n`;
    result += eval(v) + '\n';
  });
  return result;
}