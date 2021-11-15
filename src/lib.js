//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 味方クラス
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
class Friend
{
  // コンストラクタ
  constructor(name, maxHp, offense, speed, herb, herbPower)
  {
    this.name = name;            // 名前
    this.type = "friend";        // 敵味方種別
    this.maxHp = maxHp;          // 最大体力
    this.hp = maxHp;             // 体力
    this.liveFlag = true;        // 生存フラグ
    this.offense = offense;      // 攻撃力
    this.speed = speed;          // 素早さ
    this.herb = herb;            // 薬草
    this.herbPower = herbPower;  // 薬草の回復力

    this.command = "";           // 選択されたコマンド
    this.target = "";            // ターゲット
  }

  getMainParameter()
  {
    return "<b>" + this.name + "</b><br>"
           + "体力 " + this.hp + "<br>"
           + "薬草 " + this.herb + "<br>";
  }

  // ========== ここから追加する ==========
  // コマンドビューに表示するコマンド（HTML）を返す
  //     eventが"start"の場合
  //         はじめに表示するコマンド（HTML）を返す
  //     eventがユーザのコマンド選択の結果の場合
  //         eventに応じて、表示するコマンド（HTML）を返す、
  //         または、味方1人のコマンド選択を終了させる"end"を返す
  getCommand(event)
  {
    // はじめに表示するコマンド
    if(event === "start") {
      let text = ['<div><b id="friendName">' + this.name + '</b></div>',
                  '<div id="attackCommand">攻撃</div>',
                  '<div id="recoveryCommand">薬草</div>'];
      return text;
    }
    // 選択されたコマンドのidまたはclassを取得する
    if(event.target.id !== "") {
      this.command = event.target.id;
    }
    else {
      this.command = event.target.className;
    }

    // 攻撃コマンドが選択されたとき
    if(this.command === "attackCommand") {
      // 生存している敵の配列（characters配列の要素番号）を取得する
      let livedEnemy = searchLivedcharacterByType("enemy");
      // 生存している敵をコマンドビューに表示するためのHTML
      let livedEnemyHTML = [];

      // 生存している敵をコマンドビューに表示する
      for(let c of livedEnemy) {
        livedEnemyHTML.push('<div class="enemyCommand">' +
                            characters[c].name + '</div>');
      }
      livedEnemyHTML.unshift('<div><b id="friendName">' + this.name + '</b></div>');

      return livedEnemyHTML;
    }
    // 敵が選択されたとき
    else if(this.command === "enemyCommand") {
      // 選択された敵をターゲットとして保存する
      this.target = characters[searchCharacterByName(event.target.innerText)[0]];
      return "end";
    }
    // 薬草コマンドが選択されたとき
    else if(this.command === "recoveryCommand") {
      return "end";
    }
  }

  setEventHandler(event)
  {
    // コマンドの初期状態の場合
    if(event === "start") {
      // 攻撃コマンドのイベントハンドラを設定する
      attackCommand.addEventListener("click", command.callback);
      // 回復コマンドのイベントハンドラを設定する
      recoveryCommand.addEventListener("click", command.callback);
    }
    // 攻撃コマンドが選択された場合
    if(this.command === "attackCommand") {
      let element = document.getElementsByClassName("enemyCommand");
      for(let i = 0; i < element.length; ++i) {
        element[i].addEventListener("click", command.callback);
      }
    }
  }

  // 行動する
  action()
  {
    if(this.hp > 0) {
      // コマンドに応じた処理を行う
      switch(this.command) {
        // 攻撃
        case "enemyCommand":
          this.attack();
          break;
        // 回復
        case "recoveryCommand":
          this.recovery();
          break;
        default:
          Message.printMessage(this.name + "はボーッとした<br>");
      }
    }
  }
  // 攻撃する
  attack()
  {
    // 攻撃相手が生存していれば攻撃する
    if(this.target.liveFlag) {
      // 敵の体力から、自分の攻撃力を引く
      this.target.hp -= this.offense;

      // 攻撃相手の体力がマイナスになる場合は、0にする
      if(this.target.hp < 0) {
        this.target.hp = 0;
      }

      Message.printMessage(this.name + "の攻撃<br>" +
                           this.target.name + "に" + this.offense + "のダメージを与えた！<br>");
    }
    else {
      Message.printMessage(this.name + "の攻撃・・・<br>" + this.target.name + "は倒れている<br>");
    }
  }
  // 回復する
  recovery()
  {
    // 薬草がない場合
    if(this.herb <= 0) {
      Message.printMessage(this.name + "は薬草を・・・<br>薬草がない！<br>");
      return;
    }

    // 体力が最大体力の場合
    if(this.maxHp == this.hp) {
      Message.printMessage(this.name + "は薬草を・・・<br>これ以上回復できない！<br>");
      return;
    }

    // 回復する値
    let heal = this.herbPower;

    // 最大体力を超えて回復してしまいそうな場合
    if(this.maxHp - this.hp < this.herbPower) {
      heal = this.maxHp - this.hp;
    }

    // 体力を回復する
    this.hp += heal;

    // 薬草をひとつ減らす
    --this.herb;

    Message.printMessage(this.name + "は薬草を飲んだ<br>体力が" + heal + "回復した！<br>");
  }
}

class Enemy
{
  // コンストラクタ
  constructor(name, hp, offense, speed, path)
  {
    this.name = name;        // 名前
    this.type = "enemy";     // 敵味方種別
    this.hp = hp;            // 体力
    this.liveFlag = true;    // 生存フラグ
    this.offense = offense;  // 攻撃力
    this.speed = speed;      // 素早さ
    this.path = path         // 画像の場所
  }

  // 行動する
  action()
  {
    if(this.hp > 0) {
      this.attack();
    }
  }
}

class Troll extends Enemy
{
  // コンストラクタ
  constructor(name, hp, offense, speed, path)
  {
    super(name, hp, offense, speed, path);
  }

  // 攻撃メソッド
  attack()
  {
    // 生存している味方をランダムに選択する
    let f = characters[searchLivedcharacterRamdom("friend")];

    // 攻撃対象の体力から、自分の攻撃力を引く
    f.hp -= this.offense;

    // 攻撃相手の体力がマイナスになる場合は0にする
    if(f.hp < 0) {
      f.hp = 0;
    }

    // 攻撃相手が生存していれば攻撃
    if(f.liveFlag) {
      Message.printMessage(this.name + "が襲いかかってきた<br>" +
                           f.name + "は" + this.offense + "のダメージを受けた！<br>");
    }
    else {
      Message.printMessage(this.name + "の攻撃・・・<br>" + f.name + "は倒れている<br>");
    }
  }
}

class Dragon extends Enemy
{
  // コンストラクター
  constructor(name, hp, offense, speed, path)
  {
    super(name, hp, offense, speed, path);
  }

  // 攻撃メソッド
  attack()
  {
    // 一定の確率で攻撃をミスする
    if(getRandomIntInclusive(0, 4) === 4) {
      Message.printMessage("ドラゴンは<br>グフッグフッと咳き込んでいる・・・<br>");
      return;
    }

    // 生存している味方をランダムに選択する
    let f = characters[searchLivedcharacterRamdom("friend")];

    // 攻撃対象の体力から、自分の攻撃力を引く
    f.hp -= this.offense;

    // 攻撃相手の体力がマイナスになる場合は0にする
    if(f.hp < 0) {
      f.hp = 0;
    }

    // 攻撃相手が生存していれば攻撃
    if(f.liveFlag) {
      Message.printMessage(this.name + "は炎を吹いた<br>" +
                           f.name + "は" + this.offense + "のダメージを受けた！<br>");
    }
    else {
      Message.printMessage(this.name + "の攻撃・・・<br>" + f.name + "は倒れている<br>");
    }
  }
}

class GameManage
{
  // コンストラクタ
  constructor()
  {
    // 行動の順番を決める
    this.actionOrder();

    // パラメータを表示する
    this.showParameter();

    // 敵の画像を表示する
    this.showEnemyImage();

    // はじめのメッセージを表示する
    this.showFirstMessage();
  }

  actionOrder()
  {
    // 素早さでソートする
    characters.sort(
      function (a, b)
      {
        return b.speed - a.speed;
      }
    );
  }
  showParameter()
  {
    // パラメータを消去する
    parameterView.innerHTML = "";

    // 味方のパラメータを表示する
    for(let c of characters) {
      if(c.type === "friend") {
        parameterView.innerHTML += '<div class="parameter">' +
                                   c.getMainParameter() + '</div>';
      }
    }

    // 敵のパラメータをコンソールに表示する（デバッグ用）
    for(let c of characters) {
      if(c.type === "enemy" ) {
        console.log(c.name + " " + c.hp);
      }
    }
  }
  showEnemyImage()
  {
    let i = 0;
    for(let c of characters) {
      if(c.type === "enemy") {
        enemyImageView.innerHTML += '<img id="enemyImage' + characters.indexOf(c) + '" src="' + c.path
        + '" style="position:absolute; left:' + (160 * i++) +'px; bottom: 0px">';
      }
    }
  }
  showFirstMessage()
  {
    Message.printMessage("モンスターが現れた<br>");
  }
  removeDiedcharacter()
  {
    for(let c of characters) {
      if(c.hp <= 0 && c.liveFlag === true) {

        Message.addMessage(c.name + "は倒れた<br>");
        // 生存フラグを落とす
        c.liveFlag = false;

        // 敵の場合は画像を削除
        if(c.type === "enemy") {
          document.getElementById("enemyImage" + characters.indexOf(c)).remove();
        }
      }
    }
  }
  jadgeWinLose()
  {
    // 味方が残っていなければゲームオーバー
    if(! isAliveByType("friend")) {
      Message.addMessage("全滅しました・・・<br>");
      return "lose";
    }

    // 敵が残っていなければ勝利
    if(! isAliveByType("enemy")) {
      Message.addMessage("モンスターをやっつけた<br>");
      return "win";
    }

    return "none";
  }
  async battle()
  {
    // 勝敗
    let winLose = "none";

    for(let c of characters) {
      // 倒れたキャラクターはスキップする
      if(c.liveFlag === false) {
        continue;
      }

      await sleep(900);

      // 各キャラクターの行動
      c.action();

      await sleep(1100);

      // パラメータを更新する
      this.showParameter();

      await sleep(900);

      // 倒れたキャラクターを処理する
      this.removeDiedcharacter();

      await sleep(300);

      // 勝敗の判定をする
      winLose = this.jadgeWinLose();

      // 決着がついた場合
      if(winLose === "win" || winLose === "lose") {
        return false;
      }
    }
    return true;
  }
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// コマンドクラス
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
class Command
{
  // コンストラクタ
  constructor()
  {
    // コマンドを実行する味方
    this.friendElementNum = [];
    // 何人目の味方がコマンド選択中か（0が1人目）
    this.current = 0;
  }
  // コマンド入力の準備をする
  preparation()
  {
    // コマンドを実行する味方の配列を空にする
    this.friendElementNum.splice(0);

    // コマンドを選択する味方を配列に詰める
    for(let c of characters) {
      if(c.type === "friend" && c.liveFlag === true) {
        this.friendElementNum.push(characters.indexOf(c));
      }
    }

    // 味方のコマンドを取得する
    let text = characters[this.friendElementNum[this.current]].getCommand("start");
    console.log(text);
    // コマンドを表示する
    this.showCommand(text);

    console.log(this.friendElementNum[this.current]);
    // イベントハンドラを登録する
    characters[this.friendElementNum[this.current]].setEventHandler("start");
  }

  // コマンドを表示する
  showCommand(commands)
  {
    commandView.innerHTML = commands.join("");
  }

  // コマンドをクリックしたときのコールバック関数
  callback(event)
  {
    // 味方のコマンド選択
    let result = command.commandTurn(event)
    console.log(result);
    // 味方全員のコマンド選択が終わった場合
    if(result) {
      // 戦闘開始
      let promise = gameManage.battle();

      // gameManage.battle()が終了したときに実行される
      promise.then(
        // boolは、gameManage.battle()の戻り値
        function(bool)
        {
          // 戦闘が終了していない場合、コマンドを表示する
          if(bool) {
            command.preparation();
          }
        }
      );
    }
  }
  // 味方全員のコマンド選択が終わったらtrueを返す
  commandTurn(event)
  {
    // 味方1人のコマンドを取得する
    let result = characters[this.friendElementNum[this.current]].getCommand(event);

    // 味方1人のコマンド入力が終わりの場合
    if (result === "end") {

      // コマンドを選択していない味方が残っている場合
      if(! (this.current === this.friendElementNum.length - 1)) {
        // 次の味方
        ++this.current;
        // 味方のコマンドを取得する
        let text = characters[this.friendElementNum[this.current]].getCommand("start");
        // コマンドを表示する
        this.showCommand(text);
        // 表示されたコマンドにイベントハンドラを割り当てる
        characters[this.friendElementNum[this.current]].setEventHandler("start");
      }
      // 味方全員のコマンド選択が終わった場合
      else {
        // コマンドビューを空白にする
        commandView.innerHTML = "";

        this.current = 0;
        return true;
      }
    }
    // 味方1人のコマンド入力が終わっていない場合
    else {
      // 次のコマンドを表示して、イベントハンドラを登録する
      this.showCommand(result);
      // 表示されたコマンドにイベントハンドラを割り当てる
      characters[this.friendElementNum[this.current]].setEventHandler();
    }

    return false;
  }
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// メッセージクラス
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
class Message
{
  // メッセージを表示する
  static printMessage(text)
  {
    messageView.innerHTML = text;
  }

  // メッセージを追加する
  static addMessage(text)
  {
    messageView.innerHTML += text;
  }
}

function isAliveByType(type)
{
  for(let c of characters) {
    // 1人でも生存していればtrueを返す
    if(c.type === type && c.liveFlag === true) {
      return true;
    }
  }
  // 全滅しているときはfalseを返す
  return false;
}

// 名前でキャラクターを探索し、配列の要素番号を返す
function searchCharacterByName(name)
{
  // 探索した配列の要素番号
  let characterElementNum = [];

  // 指定されたキャラクターを探す
  let i = 0;
  for(let c of characters) {
    if(c.name === name) {
      characterElementNum.push(i);
    }
    ++i;
  }

  return characterElementNum;
}

function searchLivedcharacterByType(type)
{
  // 種別（type）で指定された生存しているキャラクター配列の要素番号
  let characterElementNum = [];

  // 種別（type）で指定された生存しているキャラクターを探す
  let i = 0;
  for(let c of characters) {
    if(c.type === type && c.liveFlag === true) {
      characterElementNum.push(i);
    }
    ++i;
  }

  return characterElementNum;
}

function searchLivedcharacterRamdom(type)
{
  // 生存しているキャラクターを探して、その要素番号を配列に詰める
  let livedcharacter = searchLivedcharacterByType(type)

  // 生存しているキャラクターのなかからランダムで1人選ぶ
  let randomValue = getRandomIntInclusive(0, livedcharacter.length - 1);

  return livedcharacter[randomValue];
}

function sleep(ms)
{
  return new Promise(
    function(resolve)
    {
      // msミリ秒スリープする
      setTimeout(resolve, ms);
    }
  );
}

function getRandomIntInclusive(min, max)
{
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

