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
    const ucForm = new Form("Planeamento da Unidades Curricular"); // create a new form
    ucForm.addLabelInputGroup("Nome da UC"); // add LabelInputGroup to form
    const list = ucForm.addList("Conteúdos"); // add List to form
    ucForm.addList("Objetivos", "Os conteúdos importantes são: ", list); // add List with references to form
    ucForm.show(); // Show form
  }
}

/**************************************************************/

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
    this.id = "form";
    this.title = title;
    this.contents = [];
  }

  /**
   * Add a LabelInputGroup to this form.
   * @param title - textContext of the label.
   * @returns labelInputGroup
   */
  public addLabelInputGroup(title: string): LabelInputGroup {
    const id = "content" + (this.contents.length + 1);
    const inputId = id + "Input";
    const labelInputGroup = new LabelInputGroup(id, new Label(title, inputId), new Input(inputId, "text"));
    this.contents.push(labelInputGroup);
    return labelInputGroup;
  }

  /**
   * Add a List to this form.
   * @param title - title of List.
   * @param prefix - optional prefix used to enumerate references.
   * @param referenceList - optional list that represents the list that is used for references.
   * @returns list
   */
  public addList(title: string, prefix?: string, referenceList?: List): List {
    const id = "content" + (this.contents.length + 1);
    const list = new List(id, title, prefix, referenceList);
    this.contents.push(list);
    return list;
  }

  /**
   * Shows the form in the web interface.
   */
  public show(): void {
    document.getElementById("main")!.appendChild(this.html());
  }

  /**
   * Updates the form in the web interface.
   */
  private update(): void {
    document.getElementById("main")!.innerHTML = "";
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

  }

  /**
   * Upload a form
   * @param form is a Form object that will have the proprieties of the uploaded form.
   */
  private uploadFile(form: Form): void {
    const importedFile = (document.getElementById('jsonfile') as HTMLInputElement)?.files?.item(0);
    const reader = new FileReader();
    reader.readAsText(importedFile as Blob);
    reader.onload = function () {
      const fileContent = JSON.parse(reader.result as string);
      form = new Form(fileContent.title);
      if (fileContent.contents.length > 0) {
        for (let i = 0; i < fileContent.contents.length; i++) {
          const contentJson = fileContent.contents[i];
          if (contentJson.hasOwnProperty('label')) { // LabelInputGroup
            const labelInput = form.addLabelInputGroup(contentJson.label.textContent);
            labelInput.getInput().setValue(contentJson.input.value);
          } else if (contentJson.hasOwnProperty('items')) { //Lists
            let list;
            let referenceList;
            if (contentJson.hasOwnProperty('referenceList')) {
              form.contents.forEach(element => {
                if (element.getId() == contentJson.referenceList.id && element instanceof List) {
                  referenceList = element;
                }
              })
            }
            list = form.addList(contentJson.title, contentJson.prefix, referenceList);
            const items = [];
            for (let i = 0; i < contentJson.items.length; i++) {
              const itemJson = contentJson.items[i];
              const item = new Item(itemJson.label.textContent as number, itemJson.hasAddBtn, itemJson.hasRmvBtn, list);
              item.getInput().setValue(itemJson.input.value);
              if (item.getRefDropdown() != undefined) {
                for (let x = 0; x < itemJson.refDropdown.options.length; x++) {
                  const optionsJson = itemJson.refDropdown.options[x];
                  item.getRefDropdown()!.getOptions()[x] = new Option(optionsJson.id, optionsJson.label.textContent, optionsJson.input.checked);
                }
              }
              items.push(item);
            }
            list.setItems(items);
          }
        }
      }
      form.update();
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
    saveJsonBtn.addEventListener("click", () => this.downloadJsonFile('Formulario.json', JSON.stringify(this)));
    saveJsonDiv.appendChild(saveJsonBtn);

    const uploadJsonDiv = new Div("uploadJsonDiv", ["d-inline", "p-2"]).html();
    const uploadJsonBtn = new Input("jsonfile", "file", ["btn", "btn-primary", "custom-file-input"]).html();
    uploadJsonBtn.name = "file";
    uploadJsonBtn.accept = ".json";
    uploadJsonBtn.addEventListener("change", () => this.uploadFile(this));
    uploadJsonDiv.append(uploadJsonBtn);

    const txtDiv = new Div("txtDiv", ["d-inline", "p-2"]).html();
    const txtBtn = new Button("saveTxtBtn", "Gerar ficheiro de Texto").html();
    txtBtn.addEventListener("click", () => this.downloadTxtFile('Texto.txt', this.text()));
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
    form.classList.add("m-3", "border", "border-dark");
    form.append(new Title(this.id + "Title", this.title).html());
    form.append(this.createButtonsHtml());

    for (let i = 0; i < this.contents.length; i++) {
      const html = this.contents[i].html();
      const buttons = Array.from(html.getElementsByTagName("button"));
      const inputs = Array.from(html.getElementsByTagName("input"));
      buttons.forEach(element => element.addEventListener("click", () => this.update()));
      inputs.forEach(element => element.addEventListener("change", () => this.update()));
      form.appendChild(html);
    }

    return form;
  }

  /**
   * Creates a text that shows all the contents of the form.
   * @returns string
   */
  text(): string {
    let string = "---- " + this.title + " ----" + "\n";
    this.contents.forEach(element => string += element.text() + "\n");
    return string;
  }
}

/**
 * Represents a group of label and input.
 */
export class LabelInputGroup {
  private readonly id: string;
  private label: Label;
  private readonly input: Input;

  /**
   * Constructor of LabelInputGroup.
   * @param id - id of LabelInputGroup.
   * @param label - label of LabelInputGroup.
   * @param input - input of LabelInputGroup.
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
    const div = new Div(this.id, ["m-3", "p-3", "border", "border-dark"]).html();
    div.append(this.label.html(), this.input.html());
    return div;
  }

   /**
   * Creates a text that shows the label text and input value.
   * @returns string
   */
  public text() : string {
    const text = this.label.getTextContent() + ": " + this.input.getValue();
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
   * @returns this.id
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
   *
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
  public override html() : HTMLHeadingElement {
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
  private id: string;
  private readonly type: string;
  private readonly classes: string[] | undefined;
  private value: string;
  private checked: boolean;

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
   * @param value - new value of input.
   */
  public setValue(value: string): void {
    this.value = value;
  }

  /**
   * Updates the checked of the input.
   * @param checked - new checked of input.
   */
  public setChecked(checked: boolean): void {
    this.checked = checked;
  }

  /**
   * Updates the id of the input.
   * @param id - new id of input.
   */
  public setId(id: string): void {
    this.id = id;
  }

  /**
   * Returns the value of the input.
   * @returns this.value
   */
  public getValue(): string {
    return this.value;
  }

  /**
   * Returns the checked of the input.
   * @returns this.checked
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
   * @param textContent - text of the Label.
   * @param forInput - value of htmlFor attribute of HTMLLabelElement.
   * @param classes - Optional array of strings that will represent the classList of the HTMLLabelElement.
   */
  public constructor(textContent: string, forInput: string, classes?: string[]) {
    this.textContent = textContent;
    this.forInput = forInput;
    this.classes = classes;
  }

  /**
   * Creates a HTMLLabelElement.
   * @returns HTMLDivElement with textContent,htmlFor and classList proprieties according to this object attributes.
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
   * @returns this.textContent
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
   * @param id - Id of the Div.
   * @param classes - Array of strings that will represent the classList of the HTMLDivElement.
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
   * @param id - Id of the Button.
   * @param textContent - The textContent of the button.
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
   * @param id - id of List.
   * @param title - title of List.
   * @param prefix - optional prefix used to enumerate references.
   * @param referenceList - optional list that represents the list that is used for references.
   */
  public constructor(id: string, title: string, prefix?: string, referenceList?: List) {
    this.id = id;
    this.title = title;
    this.items = [];
    this.referenceList = referenceList;
    this.prefix = prefix;
    this.addItem(this.items.length + 1, true, false); // number, hasAddBtn, hasRmvBtn
  }

  /**
   * Add item to List.
   * @param number - number of item.
   * @param hasAddBtn - boolean if item has add button or not .
   * @param hasRmvBtn - boolean if item has remove button or not .
   */
  private addItem(number: number, hasAddBtn: boolean, hasRmvBtn: boolean): void {
    const item = new Item(number, hasAddBtn, hasRmvBtn, this); // number, hasAddBtn, hasRmvBtn, list
    this.items.push(item);
  }

  /**
   * Remove item from List.
   * @param item - item that is going to be removed.
   */
  private deleteItem(item: Item): void {
    const index = item.getNumber() - 1;
    this.items.splice(index, 1);
    for (let i = 0; i < this.items.length; i++) {
      this.items[i].updateNumber(i + 1);
    }
  }

  /**
   * Creates the list as a HTMLElement.
   * @returns HTMLElement that represents the list.
   */
  html(): HTMLElement {
    const list = new Div(this.id, ["list-group", "m-3", "p-3", "border", "border-dark"]).html();
    list.append(new ListTitle(this.id + "Title", this.title).html());
    const itemsDiv = document.createElement("div");

    for (let i = 0; i < this.items.length; i++) {
      const itemHTML = this.items[i].html();
      const buttons = Array.from(itemHTML.getElementsByTagName("button"));
      buttons.forEach(
        element => {
          if (element.textContent == "+") {
            element.addEventListener("click", () => {
              this.items[i].setHasRmvBtn(true);
              this.items[i].setHasAddBtn(false);
              this.addItem(this.items.length + 1, true, true);
            })
          } else if (element.textContent == "-") {
            element.addEventListener("click", () => {
              if (i - 1 >= 0 && this.items.length == 2) {
                console.log("(i-1 >= 0 && this.items.length == 2 )");
                this.items[i - 1].setHasAddBtn(true);
                this.items[i - 1].setHasRmvBtn(false);
              } else if (this.items.length == 2) {
                console.log("(this.items.length == 2)");
                this.items[i + 1].setHasAddBtn(true);
                this.items[i + 1].setHasRmvBtn(false);
              } else if (i - 1 > 0) {
                console.log("else");
                this.items[i - 1].setHasAddBtn(true);
                this.items[i - 1].setHasRmvBtn(true);
              }
              this.deleteItem(this.items[i])
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
  text() : string{
    let text = "\n" + "--" + this.title + "--";
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      text += "\n" + "\n" + item.getLabel().getTextContent() + ": " + item.getInput().getValue();
      if (this.referenceList != undefined) {
        text += "\n" + item.getPrefix();
        for (let i = 0; i < item.getRefDropdown()!.getOptions().length; i++) {
          if (item.getRefDropdown()!.getOptions()[i].getInput().getChecked()) {
            text += "\n" + item.getRefDropdown()!.getOptions()[i].getLabel().getTextContent();
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
  getId(): string {
    return this.id;
  }

  /**
   * Returns the title of list.
   * @returns string
   */
  getTitle(): string {
    return this.title;
  }

  /**
   * Returns the prefix of list.
   * @returns string | undefined
   */
  getPrefix() {
    return this.prefix;
  }

  /**
   * Returns the reference list.
   * @returns List | undefined
   */
  getReferenceList() {
    return this.referenceList;
  }

  /**
   * Returns the items of this list.
   * @returns Item[]
   */
  getItems(): Item[] {
    return this.items;
  }

  /**
   * Sets the items of this list.
   * @param items
   */
  setItems(items: Item[]) {
    return this.items = items;
  }
}

export class Item {
  private number: number;
  private readonly id: string;
  private label: Label;
  private readonly input: Input;
  private hasAddBtn: boolean;
  private hasRmvBtn: boolean;
  private readonly refDropdown: Dropdown | undefined;
  private readonly prefix: string | undefined;


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

  public updateNumber(number: number) {
    this.number = number;
    this.label = new Label("" + number, this.id + "Input", ["form-control"]);
    this.input.setId(this.id);
  }

  public html(): HTMLDivElement {
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

    if (this.hasRmvBtn) {
      const rmvBtnDiv = new Div(this.id + "-rmvBtn", ["p-2"]).html();
      rmvBtnDiv.appendChild(new Button(this.id + "RmvBtn", "-").html());
      div.append(rmvBtnDiv);
    }

    if (this.hasAddBtn) {
      const addBtnDiv = new Div(this.id + "-addBtn", ["p-2"]).html();
      addBtnDiv.appendChild(new Button(this.id + "AddBtn", "+").html());
      div.append(addBtnDiv);
    }

    if (this.refDropdown != undefined) {
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

  public getNumber(): number {
    return this.number;
  }

  public getId(): string {
    return this.id;
  }

  public getInput(): Input {
    return this.input;
  }

  public getRefDropdown() {
    return this.refDropdown;
  }

  public setHasRmvBtn(hasRmvBtn: boolean) {
    this.hasRmvBtn = hasRmvBtn;
  }

  public setHasAddBtn(hasAddBtn: boolean) {
    this.hasAddBtn = hasAddBtn;
  }

  public getLabel(): Label {
    return this.label;
  }

  public getPrefix() {
    return this.prefix;
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

    this.updateOption();
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
  private updateOption(): void {
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
