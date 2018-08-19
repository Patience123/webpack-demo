import _ from 'lodash';
import './style.less'
import img from './assets/test1.png'
import data from './data.xml'

let a = document.createElement('h1');

a.innerHTML = _.join(['Hello', 'world'], ' ');
a.classList.add('hello');

let imgObj = new Image();
imgObj.src = img;

let main = document.getElementsByClassName('main');
main[0].insertBefore(a, main[0].firstChild);
main[0].insertBefore(imgObj, main[0].lastChild);

console.log(data);