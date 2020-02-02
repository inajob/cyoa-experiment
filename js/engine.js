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

function extractLabelId(line){
  return line.slice(1).split(/,/)[0]
}

function makeLabelMap(){
  source.forEach((line,index) => {
    if(line.length > 0 && line[0] == '*'){
      labelMap[extractLabelId(line)] = index
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
  let t = document.createTextNode(s)
  e.appendChild(t)
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
  while(!end && pos < source.length){
    let line = source[pos]
    if(line.length > 0){
      let type = ""
      let parts
      switch(line[0]){
        case '#': //comment
        break
        case '*': //label
          if(!hasChoice){
            addChoice("次へ", extractLabelId(line))
          }
          end = true
        break
        case '%': //command
          parts = line.slice(1).split(/\s+/)
          let args = parts.slice(1).join(" ").split(/,\s*/)
          switch(parts[0]){
            case "end":
              end = true
              break
            case "set":
              variables[args[0]] = args[1]
              break
            case "eqif":
              if(variables[args[0]] == args[1]){
                jump(args[2])
              }
              break
          }
        break
        case ':': //choice
          parts = line.slice(1).split(/,[\s]*/)
          addChoice(parts[0], parts[1])
          hasChoice = true
        break
        default:
          addText(line)
      }
    }
    pos ++
  }
}

run()

