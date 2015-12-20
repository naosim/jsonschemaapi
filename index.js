var express = require('express');
var app = express();
var validate = require('jsonschema').validate;
var http = require('http');
var port = parseInt(process.argv[2]);

// 終了スクリプト生成
require('fs').writeFileSync('stop.sh', 'kill -9 ' + process.pid);

app.use(express.static('public'));

// 参照・更新対象のデータ(簡単化のためオンメモリ)
var person = {
  name: 'やまだ',
  age: 20,
  east_west: 'east'
};

var referApi = {
  title: '参照',
  schema_url:'/refer/person/schema',
  valid_url:'/refer/person/valid',
  run_url: '/refer/person/run',
  json_schema:{},
  onValidationError: function(req, errors) {},
  onNormal: function(req, res) {
    res.send({
      status: http.STATUS_CODES[200],
      status_code: 200,
      response: {
        person: person
      }
    });
  }
};

var updateNameApi = {
  title: '名前更新',
  schema_url:'/update/name/schema',
  valid_url:'/update/name/valid',
  run_url:'/update/name/run',
  json_schema: {// フォームを想定しているので、階層はもたない
    $schema: "http://json-schema.org/draft-04/schema#",
    title: '名前更新',
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: "string", minLength: 1, description: "氏名" }
    }
  },
  onValidationError: function(req, errors) {},
  onNormal: function(req, res) {
    person.name = req.query.name;
    res.send({
      status: http.STATUS_CODES[200],
      status_code: 200,
      response: {
        person: person
      }
    });
  }
};

var updateAgeApi = {
  title: '年齢更新',
  schema_url:'/update/age/schema',
  valid_url:'/update/age/valid',
  run_url:'/update/age/run',
  json_schema: {// フォームを想定しているので、階層はもたない
    $schema: "http://json-schema.org/draft-04/schema#",
    title: '年齢更新',
    type: 'object',
    required: ['age'],
    properties: {
      age: { type: "string", minLength: 1, pattern: '^[0-9]*$', description: "年齢" }
    }
  },
  onValidationError: function(req, errors) {},
  onNormal: function(req, res) {
    person.age = req.query.age;
    res.send({
      status: http.STATUS_CODES[200],
      status_code: 200,
      response: {
        person: person
      }
    });
  }
};

var updateEastWestApi = {
  title: '東西更新',
  schema_url:'/update/east_west/schema',
  valid_url:'/update/east_west/valid',
  run_url:'/update/east_west/run',
  json_schema: {// フォームを想定しているので、階層はもたない
    $schema: "http://json-schema.org/draft-04/schema#",
    title: '東西更新',
    type: 'object',
    required: ['east_west'],
    properties: {
      east_west: { type: { 'enum': ['east', 'west'] }, description: "東西" }
    }
  },
  onValidationError: function(req, errors) {},
  onNormal: function(req, res) {
    person.east_west = req.query.east_west;
    res.send({
      status: http.STATUS_CODES[200],
      status_code: 200,
      response: {
        person: person
      }
    });
  }
};

var apilist = [referApi, updateNameApi, updateAgeApi, updateEastWestApi];
app.get('/apilist', function (req, res) {
  res.send({
    status: 'ok',
    status_code: 200,
    response: apilist
  });
});

apilist.forEach(function(api) {
  // スキーマ
  app.get(api.schema_url, function (req, res) {
    res.send({
      status: 'ok',
      status_code: 200,
      response: api.json_schema
    });
  });

  // バリデーション
  app.get(api.valid_url, function (req, res) {
    var validatorResult = validate(req.query, api.json_schema);
    var statusCode = validatorResult.errors.length == 0 ? 200 : 400
    // var statusCode = 400;
    res.status(statusCode)
    res.send({
      status: http.STATUS_CODES[statusCode],
      status_code: statusCode,
      response: validatorResult.errors
    });
  });

  // 実行
  app.get(api.run_url, function (req, res) {
    var validatorResult = validate(req.query, api.json_schema);
    var statusCode = validatorResult.errors.length == 0 ? 200 : 400
    // var statusCode = 400;
    if(statusCode != 200) {
      res.status(statusCode)
      res.send({
        status: http.STATUS_CODES[statusCode],
        status_code: statusCode,
        response: validatorResult.errors
      });

      // エラー処理
      if(api.onValidationError) api.onValidationError(req, validatorResult.errors);
      return
    }

    // 正常な処理
    if(api.onNormal) {
      api.onNormal(req, res);
    } else {
      res.send({
        status: http.STATUS_CODES[statusCode],
        status_code: statusCode
      });
    }
  });
})


app.listen(port);
