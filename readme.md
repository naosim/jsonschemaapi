# JSONスキーマを使ったWebAPIサンプル
フロントサイドを共通化して  
フォーム生成等を全部WebAPI側にまかせる構成のサンプル。  

あるAPIをWebからたたくために今までは  
APIを作るたびに   
入力フォーム、入力確認画面、処理結果画面  
を作っていたが、それは面倒。。  
なのでAPI側さえ作れば、フロントサイドの入力フォーム等は自動的に生成されるものが欲しかったので作ってみた。

## 動作確認
http://naosim.ddo.jp/jsonschemaapi/  
氏名、年齢、東西を変更できます。  
それぞれの変更機能ごとにフォームが表示されますが  
フォームの生成はWebAPI側からJSONSchemaを取得して  
それをもとに自動生成しています。  


## API側(node.js)の実装
たとえば名前更新機能はこんな感じ。
```javascript
var updateNameApi = {
  title: '名前更新',
  schema_url:'/update/name/schema',// json_schemaを返す
  valid_url:'/update/name/valid',  // インパラがjsonスキーマに合ってるか確認する
  run_url:'/update/name/run',      // 機能を実行する
  json_schema: {
    $schema: "http://json-schema.org/draft-04/schema#",
    title: '名前更新',
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: "string", minLength: 1, description: "氏名" }
    }
  },
  onValidationError: function(req, errors) {},
  onNormal: function(req, res) {// バリデーションが通った場合の処理
    // 名前更新
    person.name = req.query.name;

    // レスポンス
    res.send({
      status: http.STATUS_CODES[200],
      status_code: 200,
      response: {
        person: person
      }
    });
  }
};
```
各機能は3つのAPIから構成される

URLタイプ  | 説明
-----------|------
schema_url | インパラの定義を返すAPI。定義フォーマットはJSONSchema。(上記の例ではkeyがnameで長さが1以上の文字列が必須パラメータになる。)この情報を元にフロントサイドは自動的に入力フォームを生成する。←コレが今回やりたかった事。
valid_url  | 入力が間違っていないかを確認するAPI。これが通ったら、入力後の確認画面を表示するイメージ。
run_url    | 実際の処理を実行するAPI。
