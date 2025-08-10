/*
 * Copyright (c) 2020 inajob
 * This software is released under the MIT License, see LICENSE.
 */

let view = document.getElementById("view")
let source = document.getElementById("main").innerText.split(/[\r\n]/).slice(1).slice(0,-1)
let pos = 0;
let labelMap = {}
let variables = {}

const generateUuid=($=(a,b)=>(Math.floor(Math.random()*a)+b).toString(16))=>'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/x/g,_=>$(16,0)).replace(/y/g,_=>$(4,8));
const generateLabelId = (() => {return "l" + generateUuid().replace(/-/g,"")})
const generateVariableId = (() => {return "v" + generateUuid().replace(/-/g,"")})

function parseLine(line){
  let type = "text"
  let args = []
  if(line.length > 0){
    switch(line[0]){
      case '*': type = "label"; break
      case ':': type = "choice"; break
      case '#': type = "comment"; break
      case '%': type = "command"; break
    }
    switch(type){
      case "choice":
      case "label":
        args = line.slice(1).split(/,[\s]*/)
        break;
      case "command":
        let firstSpacePos = line.indexOf(" ")
        if(firstSpacePos != -1){
          args.push(line.substring(1,firstSpacePos))
          args = args.concat(line.slice(firstSpacePos + 1).split(/,[\s]*/))
        }else{
          args.push(line.slice(1))
        }
        break;
    }
  }
  return {
    type,
    args
  }
}

function makeLabelMap(){
  source.forEach((line,index) => {
    let pline = parseLine(line)
    if(pline.type == 'label'){
      labelMap[pline.args[0]] = index
    }
  })
}

makeLabelMap()

function jump(label){
  pos = labelMap[label] + 1
}

function clear(){
  view.innerHTML = ""
}

function addText(s){
  let e = document.createElement("div")
  // If the string is empty, use a non-breaking space to ensure the line is rendered.
  e.innerHTML = s.length === 0 ? "&nbsp;" : s
  view.appendChild(e)
}

function addChoice(s, label){
  let e = document.createElement("button")
  let t = document.createTextNode(s)
  e.appendChild(t)
  view.appendChild(e)
  e.addEventListener("click", ()=>{
    jump(label)
    clear()
    run()
  })
}

function run(){
  let end = false
  let hasChoice = false
  let hasText = false
  while(!end && pos < source.length){
    let line = source[pos]
    let pline = parseLine(source[pos])
    let type = ""
    switch(pline.type){
      case 'comment':
      break
      case 'label':
        if(hasText){
          if(!hasChoice){
            addChoice("次へ", pline.args[0])
          }

          end = true
        }
      break
      case 'command':
        switch(pline.args[0]){
          case "end":
            end = true
            break
          case "set":
            variables[pline.args[1]] = pline.args[2]
            break
          case "eqif":
            if(variables[pline.args[1]] == pline.args[2]){
              jump(pline.args[3])
            }
            break
        }
      break
      case 'choice':
        addChoice(pline.args[0], pline.args[1])
        hasChoice = true
      break
      default:
        addText(line)
        hasText=true
    }
    pos ++
  }
}

run()

