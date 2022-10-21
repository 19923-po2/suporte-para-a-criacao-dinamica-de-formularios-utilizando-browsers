import { Component, Directive, OnInit } from '@angular/core';
import { create } from 'domain';
import { json } from 'stream/consumers';
import { threadId } from 'worker_threads';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css'],
})

export class FormComponent implements OnInit {

  
  constructor() {

  }

  ngOnInit(): void {
    const ucForm = new Form("ucForm","Planeamento da Unidade Curricular"); // Formulario
    ucForm.addLabelInput("ucNameFormGroup",new Label("Nome da UC","ucName"),new Input("ucName","text")); // FormGroup Nome UC
    const list = ucForm.addList("contentsList","Conteúdos"); // Lista de Conteúdos
    ucForm.addList("goalsList","Objetivos",list); // Lista de Objetivos com referência à lista de conteúdos
    ucForm.show();
  }  
}

/**************************************************************/ 

export class Title{
  id: string;
  textContent: string;
  classes: string[]

  constructor(id: string, textContent: string, classes: string[]){
    this.id = id;
    this.textContent= textContent;
    this.classes = classes;
  }

  html(){
    const title = document.createElement("h1");
    title.id = this.id;
    this.classes.forEach(element => title.classList.add(element));
    title.textContent = this.textContent;
    return title;
  }
}

export class Div {
  id: string;
  classes: string[];

  constructor(id: string, classes: string[]){
    this.id = id;
    this.classes = classes;
  }
  
  html(): HTMLDivElement{
    const div = document.createElement("div");
    div.id = this.id;
    this.classes.forEach(element => div.classList.add(element));
    return div;
  }
}
export class Form {
  id: string;
  title: Title;
  contents: (List | FormGroup)[];

  constructor(id: string,title: string) {
    this.id = id;
    this.title = new Title(id+"-title",title,["text-center","p-2"]);
    this.contents = [];
  }
  
  show(){
    const formElement = this.html(); 
    document.getElementById("main")?.appendChild(formElement);
  }

  // https://stackoverflow.com/questions/34504050/how-to-convert-selected-html-to-json
  downloadJsonFile(arg: { fileName: string, text: string; }) {
    var dynamicDownload = document.createElement('a');
    const element = dynamicDownload;
    const fileType = arg.fileName.indexOf('.json') > -1 ? 'text/json' : 'text/plain';
    element.setAttribute('href', `data:${fileType};charset=utf-8,${encodeURIComponent(arg.text)}`);
    element.setAttribute('download', arg.fileName);

    var event = new MouseEvent("click");
    element.dispatchEvent(event);
  }

  // https://bobbyhadz.com/blog/typescript-left-hand-side-of-assignment-not-optional
  uploadFile(form:Form): void {
    var importedFile  = (document.getElementById('jsonfile') as HTMLInputElement)?.files?.item(0);
    var reader = new FileReader();
    reader.readAsText(importedFile as Blob);
    reader.onload = function() {
      const fileContent = JSON.parse(reader.result as string);
      form.id = fileContent.id;
      form.contents = fileContent.contents;
      //form.update(form.show());
      console.log(fileContent);
      console.log(form);
    //document.getElementById("form")!!.innerHTML = fileContent.html;
  }
  }

  //addLabelInput
  addLabelInput(id: string, label: Label, input: Input): FormGroup{
    const formGroup = new FormGroup(id, label, input);
    this.contents.push(formGroup);
    return formGroup;
  }

  //addList
  addList(id: string, title: string, referenceList? : List): List{
    const list = new List(id, title,referenceList);
    this.contents.push(list);
    return list;
  }

  createButtonsHtml(): HTMLDivElement{
    const buttonsDivHtml = new Div("buttonsDiv",["container"]).html();
    const saveJsonDivHtml = new Div("saveJsonDiv",["d-inline","p-2"]).html();
    const uploadJsonDivHtml = new Div("uploadJsonDiv",["d-inline","p-2"]).html();
    const saveJsonBtnHtml = new Btn("Save JSON").html();
    saveJsonBtnHtml.addEventListener("click",()=>this.downloadJsonFile({ fileName: 'Dados.json', text: JSON.stringify(this)}));
    
    const uploadJsonBtnHtml = new Input("jsonfile","file",["btn","btn-primary"]).html();
    uploadJsonBtnHtml.name = "file";
    uploadJsonBtnHtml.accept = ".json";
    //<input class="btn btn-primary" type="file" id="jsonfile" name="file" (change)="uploadFile()" accept=".json"/>
    saveJsonBtnHtml.addEventListener("click",()=>this.uploadFile(this));
    
    const txtBtnHtml = new Btn("Download Text").html();
    saveJsonDivHtml.appendChild(saveJsonBtnHtml);
    uploadJsonDivHtml.appendChild(uploadJsonBtnHtml);
    buttonsDivHtml.append(saveJsonDivHtml,uploadJsonDivHtml, txtBtnHtml);

    return buttonsDivHtml;
  }



  html(): HTMLElement{
    const form = document.createElement("form");
    form.id = this.id;
    form.classList.add("m-3","border", "border-dark");

    form.append(this.title.html());

    form.appendChild(this.createButtonsHtml());

    for(let i = 0; i < this.contents.length; i++){
      const html = this.contents[i].html();
      const buttons = Array.from(html.getElementsByTagName("button"));
      const inputs = Array.from(html.getElementsByTagName("input"));
      buttons.forEach(element => element.addEventListener("click",() =>  this.update(form)));
      inputs.forEach(element => element.addEventListener("change",() =>  this.update(form)));
      form.appendChild(html);
    }
    //const saveJSONBtn = this.saveJSONBtn.html();
    //saveJSONBtn.addEventListener("change",() =>  this.createJsonFile({ fileName: 'Dados.json', text: JSON.stringify(this)}));
    return form;
  }

  update(form: HTMLElement){
    form.innerHTML = "";
    for(let i = 0; i < this.contents.length; i++){
      const html = this.contents[i].html();
      const buttons = Array.from(html.getElementsByTagName("button"));
      const inputs = Array.from(html.getElementsByTagName("input"));
      buttons.forEach(element => element.addEventListener("click",() =>  this.update(form)));
      inputs.forEach(element => element.addEventListener("change",() =>  this.update(form)));
      form.appendChild(html);
    }
  }
}

export class Btn{
  textContent : string;

  constructor(textContent: string) { 
    this.textContent = textContent;
  }

  html(){
    const button = document.createElement("button");
    button.textContent = this.textContent;
    button.type = "button";
    button.classList.add("btn","btn-primary");
    return button;
  }
}

export class Input {
  id : string;
  type : string;
  value: string;
  classes: string[];

  constructor(id: string, type: string, classes : string[] = ["form-control"] , value: string = "") { 
    this.id = id;
    this.type = type;
    this.value = value;
    this.classes = classes;
  }

  html() : HTMLInputElement {
    const input = document.createElement("input");
    input.type = this.type;
    input.id = this.id;
    input.setAttribute("value",this.value);
    this.classes.forEach(element => input.classList.add(element));
    input.addEventListener("change", () =>  this.updateValue(input)); // altera valor quando o utilizador escreve no input
    return input
  }

  updateValue(input: HTMLInputElement){
    input.setAttribute("value",input.value); 
    this.value = input.value;
  }
}

export class Label {
  textContent : string;
  forInput : string;
  classes: string[];

  constructor(textContent: string, forInput: string, classes : string[] = []) { 
    this.textContent = textContent;
    this.forInput = forInput;
    this.classes = classes;
  }

  html() : HTMLLabelElement {
    const label = document.createElement("label");
    label.textContent = this.textContent;
    label.htmlFor = this.forInput;
    this.classes.forEach(element => label.classList.add(element));
    return label;
  }
}

export class FormGroup {
  id : string;
  label : Label;
  input: Input;

  constructor(id: string, label:  Label, input: Input) { 
    this.id = id;
    this.label = label;
    this.input = input;
  }

  html(){
      const div = document.createElement("div");
      div.classList.add("form-group","p-3");
      div.id = this.id;
      div.append(this.label.html(),this.input.html());
      return div;
    }

  text(){
    const text = this.label.textContent + ": " + this.input.value;
    return text;
  }
  
}

export class Checkbox {
  id : string;
  textContent: string;
  checked: boolean;

  constructor(id: string, textContent : string) { 
    this.id = id;
    this.textContent = textContent;
    this.checked = false;
  }

  html(){
    console.log("HTML");
    console.log(this.textContent);
    const div = document.createElement("div");
    div.className = "form-check";

    const input = new Input(this.id,"checkbox",["form-check-input"]);
    div.addEventListener("change", () => this.checked = this.setChecked()); // altera valor quando o utilizador escreve no input

    const label = new Label(this.textContent,this.id,["form-check-label"]);
    div.append(input.html(),label.html());
    return div;
  }
  setText(text:string){
  console.log("TEXTONCENT");
    this.textContent = text;
  }

  setChecked(){
    if(this.checked){
      return false;
    }
    else{
      return true;
    }
  }
}


export class Button {
  textContent : string;
  list: List;
  referenceList: List | undefined;

  constructor(textContent: string, list: List, referenceList?: List) { 
    this.textContent = textContent;
    this.list = list;
    this.referenceList = referenceList;
  }

  html(){
    const button = document.createElement("button");
    button.textContent = this.textContent;
    button.type = "button";
    button.classList.add("btn","btn-primary");
    if(this.textContent == "-"){
      button.addEventListener("click",() => this.list?.deleteItem());
    }
    if(this.textContent == "+"){
      button.addEventListener("click",() =>  this.list?.createItem(this.list.items.length + 1,this.list.id+"-item",true,true,this.referenceList));
    }
    return button;
  }
}

export class Dropdown {
  btnText : string;
  checkboxes: Checkbox[];

  constructor(btnText: string, options : string[]) { 
    this.btnText = btnText;
    this.checkboxes = [];
    options.forEach(element => this.checkboxes.push(new Checkbox("checkboxID",element)));
    console.log(options[0]);
  }

  html(){
    const div = document.createElement("div");
    div.innerHTML = '<a class="btn btn-primary dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">'+this.btnText+'</a>'

    const ul = document.createElement("ul");
    ul.className = "dropdown-menu";

    const li = document.createElement("li");
    const aa = document.createElement("a");
    aa.classList.add("dropdown-item");
    aa.href="#"
    this.checkboxes.forEach(element => aa.append(element.html()));
    li.appendChild(aa)
    ul.appendChild(li);
    div.appendChild(ul);
    return div;
  }

  addOption(option: string){
    this.checkboxes.push(new Checkbox("checkboxID",option));
  }

  updateOptions(options: string[]){
    this.checkboxes = [];
    options.forEach(element => this.checkboxes.push(new Checkbox("checkboxID",element)));
    console.log(options[0]);
  }
}

export class List {
  id: string;
  title: string;
  items: Item[];
  listThatUsesThisForReferences: List | undefined;
  referenceList = List;
  
  constructor(id: string, title: string, referenceList? : List) {
    referenceList?.usedAsReference(this);
    this.id = id;
    this.title = title;
    this.items = [];
    const firstItem = new Item(this.items.length + 1,this.id+"-item",true,false,this,referenceList);
    this.items.push(firstItem);
  }
  
  html(): HTMLElement{
    var list = document.createElement("div");
    list.classList.add("list-group","m-3","p-3","border", "border-dark");
    list.id = this.id;
    list.append(this.title);
    var items = document.createElement("div");
    for(let i = 0; i < this.items.length; i++){
      var item = this.items[i].html();
      if(this.listThatUsesThisForReferences != undefined){
        item.addEventListener("change",() => this.listThatUsesThisForReferences?.updateReferences(this),false);
      }
      items.append(item);
    }
    list.append(items);
    return list;
  }
  
  createItem(id: number, title: string,hasAddBtn:boolean,hasRmvBtn:boolean,referenceList? : List){
    const item = new Item(id,title,hasAddBtn,hasRmvBtn,this,referenceList);
    this.items.push(item);
  }

  deleteItem(){
    this.items.pop();
  }

  updateReferences(list:List){
    this.items.forEach(element => element.updateReferences(list));
  }

  usedAsReference(list:List){
    this.listThatUsesThisForReferences = list;
  }
  text(){
    return this.title;
  }
}

export class Item {
  itemID: string;
  label: Label;
  input: Input;
  addBtn: Button | undefined;
  rmvBtn: Button | undefined;
  referencesDropdown: Dropdown | undefined;

  constructor(number: number, itemID: string, hasAddBtn: boolean, hasRmvBtn: boolean, list: List, referenceList? : List ) {
    this.itemID = itemID;
    this.label = new Label(""+number,itemID + "-" + number,["form-control"]);
    this.input = new Input(this.itemID + "-" + number,"text");
    if(hasAddBtn){
      //this.addBtn = new Button("+",list,referenceList);
    }
    if(hasRmvBtn){
      //this.rmvBtn = new Button("-",list,referenceList);
    }
    if(referenceList != undefined){
    this.updateReferences(referenceList);
    }
  }

  updateReferences(referenceList: List){
    var options = [];
    for(let i = 0; i < referenceList.items.length; ++i){
      options.push(referenceList.items[i].input.value);
    }
    this.referencesDropdown = new Dropdown("Escolha as opções",options);
  }
  
  html(){
    var item = document.createElement("div");
    item.classList.add("list-group-item","m-2");

    var div = document.createElement("div");
    div.classList.add("d-flex", "flex-row");     

    item.appendChild(div);

    var labelDiv = document.createElement("div");
    labelDiv.classList.add("p-2");
    labelDiv.appendChild(this.label.html());

    var inputDiv = document.createElement("div");
    inputDiv.classList.add("p-2");
    inputDiv.appendChild(this.input.html());

    div.append(labelDiv,inputDiv);

    if(this.addBtn != undefined){
    var addBtnDiv = document.createElement("div");
    addBtnDiv.classList.add("p-2");
    addBtnDiv.appendChild(this.addBtn.html());
    div.append(addBtnDiv);
    }

    if(this.rmvBtn != undefined){
    var rmvBtnDiv = document.createElement("div");
    rmvBtnDiv.classList.add("p-2");
    rmvBtnDiv.appendChild(this.rmvBtn.html());
    div.append(rmvBtnDiv);
    }
    
    if(this.referencesDropdown != undefined){
    var contentReferences = document.createElement("div");
    var titleReferences = document.createElement("p");
    titleReferences.textContent = "Conteúdos";
    contentReferences.append(titleReferences);
    item.append(contentReferences,this.referencesDropdown.html());
    console.log(this.referencesDropdown.html());
    }
    return item;
  }
}