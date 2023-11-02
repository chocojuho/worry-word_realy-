const socket = io();
const score_out = document.getElementById('score-out');
const loadar = document.getElementById("load");
const now = document.getElementById("now");
const next = document.getElementById("next");
const before = document.getElementById("before");
const loadarp = document.querySelector("#load > p");
const body = document.querySelector("body");
const before2 = document.querySelector('.before2');
const before2_text1 = document.querySelector('.before2 > .word >  div:first-child > p');
const before2_text2 = document.querySelector('.before2 >  .word > div:nth-child(2) > p');
const before1 = document.querySelector('.before1');
const before1_text1 = document.querySelector('.before1 >  .word >  div:first-child > p');
const before1_text2 = document.querySelector('.before1 > .word > div:nth-child(2) > p');
const nower_text1 = document.querySelector('.nower > .word > div:first-child > p');
const nower_text2 = document.querySelector('.nower > .word > div:nth-child(2) > input');
const nower = document.querySelector('.nower'); 
let now_word = document.getElementById("word-input");
const popup = document.getElementById('popup');
const popuptext = document.querySelector('#popup > p');
const nowpath = window.location.pathname;
const roomName =  nowpath.slice(6,nowpath.length +1);   
let gamescore = {};
let gusers = [];
function getCookieValue(cookieName) {
    const name = cookieName + '=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');
  
    for (let i = 0; i < cookieArray.length; i++) {
      let cookie = cookieArray[i];
      while (cookie.charAt(0) === ' ') {
        cookie = cookie.substring(1);
      }
      if (cookie.indexOf(name) === 0) {
        return cookie.substring(name.length, cookie.length);
      }
    }
    return null;
}
const user = getCookieValue('id');
function word_check(event){
    if(event.keyCode == 13 && myturn == 1 && now_word.value){
        event.preventDefault();
        socket.emit("word",{userid : socket.id , user : user, word :now_word.value, roomname : roomName});
        now_word.value = "";
    }
}
now_word.addEventListener("keypress", word_check);
let timer;
let myturn = 0;
document.addEventListener("DOMContentLoaded", () => {
const interval = 10;
let remainingTime = 0;
function updateBar() {
    if (remainingTime > 0) {
        remainingTime--;
        barWidth = (remainingTime/1000)*100;
        loadarp.textContent = remainingTime/100 + 's';
        loadar.style.background = `linear-gradient(90deg,#00B4DB 0% ,#0083B0 ${barWidth}% )`;
    }else{
        clearInterval(timer);
    }
}
socket.emit("game",{userid : user , serial : socket.id,roomname : roomName});

popup.style.display = 'flex';
socket.on("turn",(turn)=>{
    myturn = 1;
    nower_text2.style.display = 'flex';
    body.style.background = '#FFC2D7';
    if(turn == 0){
    nower_text1.textContent = '처음입니다.';
    before.textContent = "시작";
    now.textContent= gusers[turn%gusers.length];
    next.textContent= gusers[(turn+1)%gusers.length];
    }else{
        if(turn%gusers.length-1 < 0){
            before.textContent= gusers[turn%gusers.length -1 + gusers.length];
        }else{
            before.textContent= gusers[turn%gusers.length -1];
        }
        now.textContent= gusers[turn%gusers.length];
        next.textContent= gusers[(turn+1)%gusers.length];
    }
    remainingTime = Math.round((30000-10*turn)/10);
    timer = setInterval(updateBar, interval);
});
socket.on("noturn",(turn)=>{
    if(turn == 0){
        nower_text1.textContent = '처음입니다.';
        before.textContent = "시작";
    }else{
            if(turn%gusers.length-1 < 0){
                before.textContent= gusers[turn%gusers.length -1 + gusers.length];
            }else{
                before.textContent= gusers[turn%gusers.length -1];
            }
    }
    console.log(gusers[turn%gusers.length],gusers[(turn+1)%gusers.length]);
    now.textContent= gusers[turn%gusers.length];
    next.textContent= gusers[(turn+1)%gusers.length];
    body.style.background = '#8EE2FF';
    nower_text2.style.display = "none";
    myturn = 0;
    remainingTime = Math.round((30000-11*turn)/10);
    loadarp.textContent = remainingTime/100 + 's';
    loadar.style.background = `linear-gradient(90deg,#00B4DB 0% ,#0083B0 % )`;
    timer = setInterval(updateBar, interval);
})
socket.on("turned",(guser)=>{
    socket.emit("turn",guser);
})
socket.on("start",(gameusers)=>{
    popup.style.display = 'none';
    for(const element of gameusers.users){
        if(element == null){
            continue;
        }
        gusers.push(element.id);
        const newDiv = document.createElement('div');
        gamescore[element.serial] = 0; 
        newDiv.setAttribute('id', 'a'+element.serial);
        newDiv.setAttribute('class','score');
        const newP = document.createElement('p');
        const newP2 = document.createElement('p');
        newP.textContent = element.id;
        newP2.textContent = '0점';
        newDiv.appendChild(newP);
        newDiv.appendChild(newP2);
        
        score_out.appendChild(newDiv);
    }
});
socket.on("good_word",(wordinfo)=>{
    clearInterval(timer);
    myturn = 0;
    body.style.background = '#8EE2FF';
    const update = document.querySelector(`#a${wordinfo.userid} > p:nth-child(2)`);
    gamescore[wordinfo.userid] += wordinfo.point; 
    update.textContent = gamescore[wordinfo.userid] + '점';
    if(before1.style.display == ""){
        before1.style.display = 'flex';
        before1_text1.textContent = wordinfo.word;
        before1_text2.textContent = wordinfo.describe;
    }else if(before2.style.display == ""){
        before2.style.display = 'flex';
        before2_text1.textContent = before1_text1.textContent;
        before2_text2.textContent = before1_text2.textContent;
        before1_text1.textContent = wordinfo.word;
        before1_text2.textContent = wordinfo.describe;
    }else{
        before2_text1.textContent = before1_text1.textContent;
        before2_text2.textContent = before1_text2.textContent;
        before1_text1.textContent = wordinfo.word;
        before1_text2.textContent = wordinfo.describe;
    }
    //console.log(wordinfo.lastword);
    nower_text1.textContent = wordinfo.lastword;
    nower_text2.style.display='none';
});
socket.on("wrong_word",(wordinfo)=>{
    // 해당아이디를 찾아서 빨간색으로 표시하기
     const update = document.querySelector(`#a${wordinfo.userid} > p:first-child`);
     update.style.color = 'pink';
     let temp = nower_text1.textContent;
     nower_text1.textContent = '잘못된 단어입니다.';
     setTimeout(()=>{
     update.style.color = 'white';
     nower_text1.textContent = temp;
     },500);
});

socket.on("timeout",()=>{
    popup.style.display = 'flex';
    popuptext.textContent = '시간이 종료되었습니다. 잠시후 메인화면으로 돌아갑니다';
});
socket.on("whout",()=>{
    popup.style.display = 'flex';
    popuptext.textContent = '누군가 접속을 종료했습니다.';
});

socket.on("gameover",()=>{
    window.location.href = `/room/${roomName}`;
});
 });
