import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css'],
})

export class FormComponent implements OnInit {

  constructor() {

  }

  ngOnInit(): void {
    const ucForm = new Form("Descritor da Unidades Curricular"); // create a new form
    ucForm.addLabelInputGroup("Curso: "); // add LabelInputGroup to form
    ucForm.addLabelInputGroup("Unidade Curricular: "); // add LabelInputGroup to form
    ucForm.addLabelInputGroup("Ano: "); // add LabelInputGroup to form
    ucForm.addLabelInputGroup("Semestre: "); // add LabelInputGroup to form
    ucForm.addLabelInputGroup("Tipo de unidade curricular: "); // add LabelInputGroup to form
    ucForm.addLabelInputGroup("Modo de Ensino: "); // add LabelInputGroup to form
    ucForm.addLabelInputGroup("Docente Responsável: "); // add LabelInputGroup to form
    const list = ucForm.addList("CONTEÚDOS PROGRAMÁTICOS"); // add List to form
    ucForm.addList("OBJETIVOS EDUCACIONAIS", "Indicam-se seguidamente quais os conteúdos relevantes para este obtivo: ", list); // add List with references to form
    ucForm.show(); // Show form
  }
}

/**
 * Represents a form.
 */
export class Form {
  private readonly id: string;  // id of Form
  private readonly title: string; // title of Form
  private contents: (List | LabelInputGroup)[]; // contents of form is an array of objects List and LabelInputGroup

  /**
   * Constructor of Form.
   * @param title is the title of form.
   */
  public constructor(title: string) {
    this.id = "form"; // id is always "form"
    this.title = title;
    this.contents = [];
  }

  /**
   * Add a LabelInputGroup to this form.
   * @param title is the text content of the label.
   * @returns LabelInputGroup
   */
  public addLabelInputGroup(title: string): LabelInputGroup {
    const id = "content" + (this.contents.length + 1); // this id prefix is always "content"
    const inputId = id + "Input"; // inputId suffix is always "Input"
    const labelInputGroup = new LabelInputGroup(id, new Label(title, inputId), new Input(inputId, "text"));
    this.contents.push(labelInputGroup); // push to array of contents
    return labelInputGroup;
  }

  /**
   * Add a List to this form.
   * @param title is the title of List.
   * @param prefix is an optional prefix used to enumerate references.
   * @param referenceList is an optional list that represents the list that is used for references.
   * @returns List
   */
  public addList(title: string, prefix?: string, referenceList?: List): List {
    const id = "content" + (this.contents.length + 1);  // this id prefix is always "content"
    const list = new List(id, title, prefix, referenceList);
    this.contents.push(list); // push to contents array
    return list;
  }

  /**
   * Shows the form in the web interface.
   */
  public show(): void {
    document.getElementById("main")!.appendChild(this.html()); // appends the form html to an pre-existing html element with id = "main"
  }

  /**
   * Updates the form in the web interface.
   */
  private update(): void {
    document.getElementById("main")!.innerHTML = ""; // removes the previous form html code
    this.show();
  }

  /**
   * Download Form in Json format.
   * Code taken from: {@link https://stackoverflow.com/questions/34504050/how-to-convert-selected-html-to-json}
   * @param fileName is the name of the file.
   * @param text is the text content of the file.
   */
  private downloadJsonFile(fileName: string, text: string): void {
    const element = document.createElement('a');
    const fileType = fileName.indexOf('.json') > -1 ? 'text/json' : 'text/plain';
    element.setAttribute('href', `data:${fileType};charset=utf-8,${encodeURIComponent(text)}`);
    element.setAttribute('download', fileName);

    const event = new MouseEvent("click");
    element.dispatchEvent(event);
    this.update();
  }

  /**
   * Download form content in .txt format.
   * Code taken from: {@link https://stackoverflow.com/questions/34504050/how-to-convert-selected-html-to-json}
   * @param fileName is the name of the file.
   * @param text is the text content of the file.
   */
  private downloadTxtFile(fileName: string, text: string): void {
    const element = document.createElement('a');
    const fileType = fileName.indexOf('.txt') > -1 ? 'text/txt' : 'text/plain';
    element.setAttribute('href', `data:${fileType};charset=utf-8,${encodeURIComponent(text)}`);
    element.setAttribute('download', fileName);
    const event = new MouseEvent("click");
    element.dispatchEvent(event);
    this.update();
  }

  /**
   * Upload a form using a JSON File.
   * @param form is a Form object that will have the proprieties of the uploaded form.
   */
  private uploadFile(form: Form): void {
    const importedFile = (document.getElementById('jsonfile') as HTMLInputElement)?.files?.item(0); // get the file.
    const reader = new FileReader();
    reader.readAsText(importedFile as Blob); // read the file.
    reader.onload = function () {
      const fileContent = JSON.parse(reader.result as string);
      form = new Form(fileContent.title); // create a new form using the title from the Json file.
      if (fileContent.contents.length > 0) { // creates all the contents.
        for (let i = 0; i < fileContent.contents.length; i++) {
          const contentJson = fileContent.contents[i]; // this content.
          if (contentJson.hasOwnProperty('label')) { //  if this content is a LabelInputGroup (only this object has the property 'label').
            const labelInputGroup = form.addLabelInputGroup(contentJson.label.textContent);  // creates a LabelInputGroup object.
            labelInputGroup.getInput().setValue(contentJson.input.value); // insert the input value in the LabelInputGroup object.
          } else if (contentJson.hasOwnProperty('items')) { //  if this content is a List (only this object has the property 'items').
            let list;
            let referenceList;
            if (contentJson.hasOwnProperty('referenceList')) { // if it's a List with references.
              form.contents.forEach(element => {
                if (element.getId() == contentJson.referenceList.id && element instanceof List) {  // finds the referenceList of this List in the array of contents
                  referenceList = element;
                }
              })
            }
            list = form.addList(contentJson.title, contentJson.prefix, referenceList); // creates List
            const items = [];
            for (let i = 0; i < contentJson.items.length; i++) { // for each item of list
              const itemJson = contentJson.items[i];
              const item = new Item(itemJson.label.textContent as number, itemJson.hasAddBtn, itemJson.hasRmvBtn, list);  // create item from List
              item.getInput().setValue(itemJson.input.value); // sets value of input in item
              if (item.getRefDropdown() != undefined) {
                for (let x = 0; x < itemJson.refDropdown.options.length; x++) { // creates references dropdown of item
                  const optionsJson = itemJson.refDropdown.options[x];
                  item.getRefDropdown()!.getOptions()[x] = new Option(optionsJson.id, optionsJson.label.textContent, optionsJson.input.checked); // create option of dropdown
                }
              }
              items.push(item);
            }
            list.setItems(items); // sets all list items
          }
        }
      }
      form.update(); // updates interface
    }
  }

  /**
   * Creates the buttons for upload and download form and to download text file.
   * @returns HtmlDivElement that contains the buttons.
   */
  private createButtonsHtml(): HTMLDivElement {
    const buttonsDiv = new Div("buttonsDiv", ["container"]).html();

    const saveJsonDiv = new Div("saveJsonDiv", ["d-inline", "p-2"]).html();
    const saveJsonBtn = new Button("saveJsonBtn", "Guardar Formulário").html();
    saveJsonBtn.addEventListener("click", () => this.downloadJsonFile(this.title+'.json', JSON.stringify(this))); // download json file when clicked
    saveJsonDiv.appendChild(saveJsonBtn);

    const uploadJsonDiv = new Div("uploadJsonDiv", ["d-inline", "p-2"]).html();
    const uploadJsonBtn = new Input("jsonfile", "file", ["btn", "btn-primary", "custom-file-input"]).html();
    uploadJsonBtn.name = "file";
    uploadJsonBtn.accept = ".json";
    uploadJsonBtn.addEventListener("change", () => this.uploadFile(this)); // call uploadfile() when file is uploaded
    uploadJsonDiv.append(uploadJsonBtn);

    const txtDiv = new Div("txtDiv", ["d-inline", "p-2"]).html();
    const txtBtn = new Button("saveTxtBtn", "Gerar ficheiro de Texto").html();
    txtBtn.addEventListener("click", () => this.downloadTxtFile(this.title+'.txt', this.text())); // download txt file when button is clicked
    txtDiv.append(txtBtn);
    buttonsDiv.append(saveJsonDiv, uploadJsonDiv, txtDiv);

    return buttonsDiv;
  }

  /**
   * Creates the form as a HTMLElement.
   * @remarks everytime a button is clicked or an input is changed, the forms suffers an update.
   * of this object.
   * @returns HTMLElement that represents the form.
   */
  public html(): HTMLElement {
    const form = document.createElement("form");
    form.id = this.id;
    form.classList.add("m-3", "border", "border-dark"); // classes
    form.append(new Title(this.id + "Title", this.title).html()); // title of form
    form.append(this.createButtonsHtml());

    for (let i = 0; i < this.contents.length; i++) {
      const html = this.contents[i].html(); // this content html code
      const buttons = Array.from(html.getElementsByTagName("button")); // this content buttons
      const inputs = Array.from(html.getElementsByTagName("input")); // this content inputs
      buttons.forEach(element => element.addEventListener("click", () => this.update())); // update when a button is clicked
      inputs.forEach(element => element.addEventListener("change", () => this.update())); // update when a input is changed
      form.appendChild(html);
    }
    return form;
  }

  /**
   * Creates a text that shows all the contents of the form.
   * @returns string
   */
  private text(): string {
    let string = "---- " + this.title + " ----" + "\n" +"\n"; // title text
    this.contents.forEach(element => string += element.text() + "\n"); // contents text
    return string;
  }
}

/**
 * Represents a group of a label and an input.
 */
export class LabelInputGroup {
  private readonly id: string;
  private label: Label;
  private readonly input: Input;

  /**
   * Constructor of LabelInputGroup.
   * @param id is the id of LabelInputGroup.
   * @param label is the label of LabelInputGroup.
   * @param input is the input of LabelInputGroup.
   */
  public constructor(id: string, label: Label, input: Input) {
    this.id = id;
    this.label = label;
    this.input = input;
  }

  /**
   * Creates a HTMLDivElement using a Div object.
   * @remarks This HTMLDivElement has the classes "m-3", "p-3", "border" and "border-dark".
   * Both label and inputs Html Elements are appended to the Div Html Element.
   * @returns HTMLDivElement using the html() method from a Div object.
   */
  public html(): HTMLDivElement {
    const div = new Div(this.id, ["m-3", "p-3", "border", "border-dark"]).html(); // Div object
    div.append(this.label.html(), this.input.html()); // append each label and input html to div
    return div;
  }

  /**
   * Creates a text that shows the label text and input value.
   * @returns string
   */
  public text(): string {
    const text = this.label.getTextContent() + ": " + this.input.getValue(); // label text and input value
    return text;
  }

  /**
   * Returns the id of labelinputgroup.
   * @returns this.id
   */
  public getId(): string {
    return this.id;
  }

  /**
   * Returns the input of labelinputgroup.
   * @returns this.input
   */
  public getInput(): Input {
    return this.input;
  }
}

/**
 * Represents the title of the form.
 */
export class Title {
  private id: string;
  private textContent: string;

  /**
   * Constructor of Title.
   * @param id - id of title.
   * @param textContent - text of the title.
   */
  constructor(id: string, textContent: string) {
    this.id = id;
    this.textContent = textContent;
  }

  /**
   * Creates a HTMLHeadingElement.
   * @remarks This HTMLHeadingElement has the tagName "h1" and the classes "text-center" and "p-2".
   * @returns HTMLHeadingElement with id textContent according to this object attributes.
   */
  public html(): HTMLHeadingElement {
    const title = document.createElement("h1");
    title.id = this.id;
    title.textContent = this.textContent;
    title.classList.add("text-center", "p-2");
    return title;
  }

  /**
   * Returns the id of the title.
   * @returns string
   */
  public getId(): string {
    return this.id;
  }

  /**
   * Returns the text content of the title.
   * @returns this.id
   */
  public getTextContent(): string {
    return this.textContent;
  }

}

/**
 * Represents the title of a list.
 */
export class ListTitle extends Title {
  /**
   * Constructor of Title.
   * @param id - id of title.
   * @param textContent - text of the title.
   * @remarks Super is used to access the superclass constructor.
   */
  public constructor(id: string, textContent: string) {
    super(id, textContent);
  }

  /**
   * Creates a HTMLHeadingElement.
   * @remarks This HTMLHeadingElement has the tagName "h5" and the class "p-2".
   * @returns HTMLHeadingElement with id textContent according to this object attributes.
   * @override
   */
  public override html(): HTMLHeadingElement {
    const title = document.createElement("h5");
    title.id = this.getId();
    title.textContent = this.getTextContent();
    title.classList.add("p-2");
    return title;
  }
}

/**
 * Represents an input.
 */
export class Input {
  private id: string; // id of input
  private readonly type: string; // type of input (example: "text" or "checkbox")
  private readonly classes: string[] | undefined; // classes
  private value: string; // value of input
  private checked: boolean; // used for inputs of type checkbox

  /**
   * Constructor of Input.
   * @param id - Id of input.
   * @param type - type of input.
   * @param classes - Array of strings that will represent the classList of the HTMLInputElement.
   * @param value - value of input.
   * @param checked - boolean that is true if input is checked, and false if input is not checked.
   *
   */
  constructor(id: string, type: string, classes: string[] = ["form-control"], value: string = "", checked: boolean = false) {
    this.id = id;
    this.type = type;
    this.classes = classes;
    this.value = value;
    this.checked = checked;
  }

  /**
   * Creates a HTMLInputElement.
   * @remarks This HTMLInputElement has an eventListener that is triggered by change and updates the value and checked
   * of this object.
   * @returns HTMLInputElement with id,type,value,checked,classList proprieties according to this object attributes.
   */
  public html(): HTMLInputElement {
    const input = document.createElement("input");
    input.id = this.id;
    input.type = this.type;
    input.value = this.value;
    input.checked = this.checked;
    input.addEventListener("change", () => {
      this.value = input.value;
      this.checked = input.checked;
    });
    this.classes?.forEach(element => input.classList.add(element))
    return input;
  }

  /**
   * Updates the value of the input.
   * @param value is the new value of input.
   */
  public setValue(value: string): void {
    this.value = value;
  }

  /**
   * Updates the checked of the input.
   * @param checked is true or false.
   */
  public setChecked(checked: boolean): void {
    this.checked = checked;
  }

  /**
   * Updates the id of the input.
   * @param id is the new id of input.
   */
  public setId(id: string): void {
    this.id = id;
  }

  /**
   * Returns the value of the input.
   * @returns string
   */
  public getValue(): string {
    return this.value;
  }

  /**
   * Returns the checked of the input.
   * @returns string
   */
  public getChecked(): boolean {
    return this.checked;
  }
}

/**
 * Represents a label.
 */
export class Label {
  private readonly textContent: string;
  private readonly forInput: string;
  private readonly classes: string[] | undefined;

  /**
   * Constructor of Label.
   * @param textContent is the text content of the Label.
   * @param forInput is the value of htmlFor attribute of HTMLLabelElement.
   * @param classes is an optional array of strings that will represent the classList of the HTMLLabelElement.
   */
  public constructor(textContent: string, forInput: string, classes?: string[]) {
    this.textContent = textContent;
    this.forInput = forInput;
    this.classes = classes;
  }

  /**
   * Creates a HTMLLabelElement.
   * @returns HTMLLabelElement with textContent,htmlFor and classList proprieties according to this object attributes.
   */
  public html(): HTMLLabelElement {
    const label = document.createElement("label");
    label.textContent = this.textContent;
    label.htmlFor = this.forInput;
    this.classes?.forEach(element => label.classList.add(element))
    return label;
  }

  /**
   * Returns the text content of this label.
   * @returns string
   */
  public getTextContent(): string {
    return this.textContent;
  }
}

/**
 * Represents a division or a section.
 */
export class Div {
  private readonly id: string;
  private classes: string[];

  /**
   * Constructor of Div.
   * @param id is the id of the Div.
   * @param classes is an array of strings that will represent the classList of the HTMLDivElement.
   */
  public constructor(id: string, classes: string[]) {
    this.id = id;
    this.classes = classes;
  }

  /**
   * Creates a HTMLDivElement.
   * @returns HTMLDivElement with Id and classList proprieties according to this object attributes.
   */
  public html(): HTMLDivElement {
    const div = document.createElement("div");
    div.id = this.id;
    this.classes.forEach(element => div.classList.add(element));
    return div;
  }
}

/**
 * Represents a button.
 */
export class Button {
  private readonly id: string;
  private readonly textContent: string;

  /**
   * Constructor of Button.
   * @param id is the id of the Button.
   * @param textContent is he text content of the button.
   */
  public constructor(id: string, textContent: string) {
    this.id = id;
    this.textContent = textContent;
  }

  /**
   * Creates a HTMLButtonElement.
   * @remarks This HTMLButtonElement has two classes "btn" and "btn-primary".
   * @returns HTMLButtonElement with Id and textContent proprieties according to this object attributes.
   * @public
   */
  public html(): HTMLButtonElement {
    const button = document.createElement("button");
    button.id = this.id;
    button.textContent = this.textContent;
    button.classList.add("btn", "btn-primary");
    return button;
  }
}

/**
 * Represents a list.
 */
export class List {
  private readonly id: string;
  private readonly title: string;
  private readonly prefix: string | undefined;
  private readonly referenceList: List | undefined;
  private items: Item[];

  /**
   * Constructor of List.
   * @param id is the id of List.
   * @param title is the title of List.
   * @param prefix is an optional prefix used to enumerate references.
   * @param referenceList is an optional list that represents the list that is used for references.
   */
  public constructor(id: string, title: string, prefix?: string, referenceList?: List) {
    this.id = id;
    this.title = title;
    this.items = [];
    this.referenceList = referenceList;
    this.prefix = prefix;
    this.addItem(this.items.length + 1, true, false); // add the first item this list
  }

  /**
   * Add item to List.
   * @param number is the number of item.
   * @param hasAddBtn is a boolean if item has add button or not.
   * @param hasRmvBtn is a boolean if item has remove button or not.
   */
  private addItem(number: number, hasAddBtn: boolean, hasRmvBtn: boolean): void {
    const item = new Item(number, hasAddBtn, hasRmvBtn, this);
    this.items.push(item); // push item to array.
  }

  /**
   * Remove item from array.
   * @param item is the item that is going to be removed.
   */
  private deleteItem(item: Item): void {
    const index = item.getNumber() - 1; // an item index in array is always number - 1
    this.items.splice(index, 1);
    for (let i = 0; i < this.items.length; i++) {
      this.items[i].updateNumber(i + 1); // update the number of all the items, after removal
    }
  }

  /**
   * Creates the list as a HTMLElement.
   * @returns HTMLElement that represents the list.
   */
  public html(): HTMLElement {
    const list = new Div(this.id, ["list-group", "m-3", "p-3", "border", "border-dark"]).html();
    list.append(new ListTitle(this.id + "Title", this.title).html()); // list title
    const itemsDiv = document.createElement("div");

    for (let i = 0; i < this.items.length; i++) {
      const itemHTML = this.items[i].html(); // item html
      const buttons = Array.from(itemHTML.getElementsByTagName("button"));
      /* add event listeners for each button */
      buttons.forEach(
        element => {
          if (element.textContent == "+") { // add button
            element.addEventListener("click", () => {
              this.items[i].setHasRmvBtn(true);
              this.items[i].setHasAddBtn(false);
              this.addItem(this.items.length + 1, true, true); // add item (last item has addBtn and rmvBtn)
            })
          } else if (element.textContent == "-") { // remove button
            element.addEventListener("click", () => {
              if(i == 0  && this.items.length == 2){ // if theres 2 items left, and first is removed
                this.items[i+1].setHasAddBtn(true);
                this.items[i+1].setHasRmvBtn(false);
              }
              else if(i == 1  && this.items.length == 2){ // if theres 2 items left, and second is removed
                this.items[i-1].setHasAddBtn(true);
                this.items[i-1].setHasRmvBtn(false);
              }
              else if(i == this.items.length -1){ // if last item is removed
                this.items[i-1].setHasAddBtn(true);
                this.items[i-1].setHasRmvBtn(true);
              }
              this.deleteItem(this.items[i]) // delete this item
            });
          }
        })
      itemsDiv.append(itemHTML);
    }
    list.append(itemsDiv);
    return list;
  }

  /**
   * Creates a text that shows all the contents of the list.
   * @returns string
   */
  public text(): string {
    let text = "\n" + "--" + this.title + "--"; // title
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      text += "\n" + "\n" + item.getLabel().getTextContent() + ":" + "\n" + item.getInput().getValue(); // label and input of item
      if (this.referenceList != undefined) { // references
        text +=  "\n" + item.getPrefix(); // prefix
        for (let i = 0; i < item.getRefDropdown()!.getOptions().length; i++) {
          if (item.getRefDropdown()!.getOptions()[i].getInput().getChecked()) {
            text += "\n" + item.getRefDropdown()!.getOptions()[i].getLabel().getTextContent(); // reference text
          }
        }
      }
    }
    return text;
  }

  /**
   * Returns the id of list.
   * @returns string
   */
  public getId(): string {
    return this.id;
  }

  /**
   * Returns the title of list.
   * @returns string
   */
  public getTitle(): string {
    return this.title;
  }

  /**
   * Returns the prefix of list.
   * @returns string | undefined
   */
  public getPrefix() : string | undefined {
    return this.prefix;
  }

  /**
   * Returns the reference list.
   * @returns List | undefined
   */
  public getReferenceList() : List | undefined{
    return this.referenceList;
  }

  /**
   * Returns the items of this list.
   * @returns Item[]
   */
  public getItems(): Item[] {
    return this.items;
  }

  /**
   * Sets the items of this list.
   * @param items
   */
  public setItems(items: Item[]) {
    return this.items = items;
  }
}

/**
 * Represents an item.
 */
export class Item {
  private number: number; 
  private readonly id: string;
  private label: Label;
  private readonly input: Input;
  private hasAddBtn: boolean;
  private hasRmvBtn: boolean;
  private readonly refDropdown: Dropdown | undefined;
  private readonly prefix: string | undefined;

  /**
   * Constructor of Item.
   * @param number is the number of item.
   * @param hasAddBtn is a boolean if item has add button or not.
   * @param hasRmvBtn is a boolean if item has remove button or not.
   * @param list is the list this item gonna be added.
   */
  public constructor(number: number, hasAddBtn: boolean, hasRmvBtn: boolean, list: List) {
    this.number = number;
    this.id = list.getId() + 'Item' + number;
    this.hasAddBtn = hasAddBtn;
    this.hasRmvBtn = hasRmvBtn;
    this.prefix = list.getPrefix();
    this.label = new Label(number + "", this.id + "Input", ["form-control"]);
    this.input = new Input(this.id + "Input", "text");
    const referenceList = list.getReferenceList()
    if (referenceList != undefined) {
      this.refDropdown = new Dropdown(this.id + "refDropdown", referenceList);
    }
  }

  /**
   * Updates the number of the item.
   * @param number is the new number of item.
   */
  public updateNumber(number: number) {
    this.number = number;
    this.label = new Label("" + number, this.id + "Input", ["form-control"]);
    this.input.setId(this.id);
  }

  /**
   * Creates a HTMLDivElement using a Div object.
   * @returns HTMLDivElement using the html() method from a Div object.
   */
  public html(): HTMLDivElement {
    this.refDropdown?.updateOption();
    const itemDiv = document.createElement("div");
    itemDiv.classList.add("list-group-item", "m-2");

    const div = document.createElement("div");
    div.classList.add("d-flex", "flex-row");

    itemDiv.appendChild(div);

    const labelDiv = new Div(this.id + "-label", ["p-2"]).html();
    const inputDiv = new Div(this.id + "-input", ["p-2", "col-10"]).html();
    labelDiv.appendChild(this.label.html());
    inputDiv.appendChild(this.input.html());

    div.append(labelDiv, inputDiv);

    if (this.hasRmvBtn) { // add rmvBtn
      const rmvBtnDiv = new Div(this.id + "-rmvBtn", ["p-2"]).html();
      rmvBtnDiv.appendChild(new Button(this.id + "RmvBtn", "-").html());
      div.append(rmvBtnDiv);
    }

    if (this.hasAddBtn) { // add addBtn
      const addBtnDiv = new Div(this.id + "-addBtn", ["p-2"]).html();
      addBtnDiv.appendChild(new Button(this.id + "AddBtn", "+").html());
      div.append(addBtnDiv);
    }

    if (this.refDropdown != undefined) { // add refDropdown
      const contentReferences = new Div(this.id + "RefDropdownDiv", ["m-2"]).html();
      const title = document.createElement("p");
      const list = document.createElement("ul");
      if (this.prefix != undefined) {
        title.textContent = this.prefix;
      }
      for (let i = 0; i < this.refDropdown.getOptions().length; i++) {
        if (this.refDropdown.getOptions()[i].getInput().getChecked()) {
          const listItem = document.createElement("li");
          listItem.textContent = this.refDropdown.getOptions()[i].getLabel().getTextContent();
          list.appendChild(listItem);
        }
      }
      contentReferences.append(title, list);
      itemDiv.append(contentReferences, this.refDropdown.html());
    }
    return itemDiv;
  }

  /**
   * Returns the number of item.
   * @returns number
   */
  public getNumber(): number {
    return this.number;
  }

/**
   * Returns the id of item.
   * @returns string
   */
  public getId(): string {
    return this.id;
  }

  /**
   * Returns the input of item.
   * @returns Input
   */
  public getInput(): Input {
    return this.input;
  }

  /**
   * Returns the refDropdown of item.
   * @returns Dropdown | undefined
   */
  public getRefDropdown() : Dropdown | undefined {
    return this.refDropdown;
  }

  /**
   * Returns the prefix of item.
   * @returns string | undefined
   */
  public getPrefix() : string | undefined {
    return this.prefix;
  }

  /**
   * Returns the label of item.
   * @returns Label
   */
  public getLabel(): Label {
    return this.label;
  }

  /**
   * Set the value of hasRmvBtn
   * @param hasRmvBtn is a boolean that defines if this item has a rmvBtn
   */
  public setHasRmvBtn(hasRmvBtn: boolean) {
    this.hasRmvBtn = hasRmvBtn;
  }

  /**
   * Set the value of hasAddBtn
   * @param hasRmvBtn is a boolean that defines if this item has a addBtn
   */
  public setHasAddBtn(hasAddBtn: boolean) {
    this.hasAddBtn = hasAddBtn;
  }

}

/**
 * Represents a Dropdown.
 */
export class Dropdown {
  private readonly id: string;
  private referenceList: List;
  private options: Option[];

  /**
   * Constructor of Option.
   * @param id - Id of the Dropdown.
   * @param referenceList - list of reference for this dropdown.
   * @param options - array of options.
   */
  constructor(id: string, referenceList: List) {
    this.id = id;
    this.referenceList = referenceList;
    this.options = [];
  }

  /**
   * Creates a HTMLDivElement using a Div object.
   * @returns HTMLDivElement using the html() method from a Div object.
   */
  public html(): HTMLDivElement {
    const div = document.createElement("div");
    const a = document.createElement("a");
    a.classList.add("btn", "btn-primary", "dropdown-toggle");
    a.setAttribute("data-bs-toggle", "dropdown");
    a.textContent = this.referenceList.getTitle();
    div.append(a);

    const ul = document.createElement("ul");
    ul.className = "dropdown-menu";

    const li = document.createElement("li");
    const aa = document.createElement("a");
    aa.classList.add("dropdown-item");

    this.options.forEach(element => {
      aa.append(element.html())
    });

    li.appendChild(aa)
    ul.appendChild(li);
    div.appendChild(ul);
    return div;
  }

  /**
   * Updates the options of this dropdown.
   */
  public updateOption(): void {
    const newOptions = []; 

    for (let i = 0; i < this.referenceList.getItems().length; i++) {
      const item = this.referenceList.getItems()[i];
      if (item.getInput().getValue() != "") {
        const option = new Option(this.id + "Option" + item.getId(), item.getInput().getValue());
        this.options.forEach(element => {
          if (option.getLabel().getTextContent() == element.getLabel().getTextContent()) {
            option.getInput().setChecked(element.getInput().getChecked());
          }
        })
        newOptions.push(option);
      }
    }
    this.options = newOptions;
  }

  /**
   * Returns the array of options.
   * @returns Option[]
   */
  public getOptions(): Option[] {
    return this.options;
  }
}

/**
 * Represents an option.
 */
export class Option {
  private readonly id: string;
  private readonly label: Label;
  private readonly input: Input;

  /**
   * Constructor of Option.
   * @param id - Id of the Option.
   * @param text - The textContent of the Label of the Option.
   * @param checked - checked attribute of Input of the Option.
   */
  public constructor(id: string, text: string, checked: boolean = false) {
    this.id = id;
    this.label = new Label(text, this.id + "Input", ["form-check-label"]);
    this.input = new Input(this.id + "Input", "checkbox", ["form-check-input"], undefined, checked);
  }

  /**
   * Creates a HTMLDivElement using a Div object.
   * @remarks This HTMLDivElement has the class "form-check".
   * Both label and inputs Html Elements are appended to the Div Html Element.
   * @returns HTMLDivElement using the html() method from a Div object.
   */
  public html(): HTMLDivElement {
    const div = new Div(this.id + "Option", ["form-check"]).html();
    div.append(this.input.html(), this.label.html());
    return div;
  }

  /**
   * Returns the label of option.
   * @returns this.label
   */
  public getLabel(): Label {
    return this.label;
  }

  /**
   * Returns the input of option.
   * @returns Input
   */
  public getInput(): Input {
    return this.input;
  }

}
