class NodeList{
  constructor (names = [], labels = [], classes = []) {
    this.nameList = [...names];
    this.nextList = [...names].map((value, index) => index);
    this.labelList = [...labels];
    this.classList = [...classes];
    this.nodeName = Object.fromEntries(names.map((value) => [value, value]));
    this.nodeLabel = Object.fromEntries(labels.map((value, index) => [names[index], labels[index]]));
    this.nodeClass = Object.fromEntries(labels.map((value, index) => [names[index], classes[index]]));
    this.mask = '';
  }
  setMask(mask) {
    this.mask = mask;
    return this;
  }
  add(name) {
    this.index = this.list.indexOf(name);
    return this;
  }
  setByName(name) {
    this.index = this.nameList.indexOf(name);
    return this;
  }
  setByIndex(index) {
    this.index = index;
    return this;
  }
  setNextByName(name, nextName) {
    const nextIndex = this.nameList.indexOf(nextName); 
    
    this.setByIndex(this.nameList.indexOf(name));
    this.nextList[this.index] = nextIndex;
    return this;
  }
  setNext(flag) {
    
    if (flag) {
      this.index = this.nextList[this.index];
    }
    return this;
  }
  getMask() {
    return this.mask;
  }
  getName() {
    return this.nameList[this.index];
  }
  getLabel() {
    return this.labelList[this.index];
  }
  getClass() {
    return this.classList[this.index];
  }
  getId() {
    const name = this.nameList[this.index];
    return `${this.mask}${name}`;
  }
  getLength () {
    return this.nameList.length;
  }
}

const DEFAULT_TASKS = [
  {text: ''},
  {text: 'Pay Bills', completed: false, saved: true},
  {text: 'Go Shopping', completed: false, saved: false},
  {text: 'See the Doctor', completed: true, saved: true}
];

const properties = new NodeList(['tag', 'name', 'function', 'action', 'saved', 'completed', 'next']);
const sections = new NodeList(['new', 'incomplete', 'complete'], ['Add item', 'Todo', 'Completed']).setMask('section-');
const tasks = new NodeList(['new', 'incomplete', 'complete']).setMask('tasks-').setNextByName('incomplete', 'complete').setNextByName('complete', 'incomplete');
const buttons = new NodeList(['add', 'edit', 'save', 'delete'], ['Add', 'Edit', 'Save', 'Delete'], ['button', 'button', 'button', 'button-delete']).setNextByName('edit', 'save').setNextByName('save', 'edit');
const actions = new NodeList(['add', 'edit', 'save', 'delete', 'checkbox'], ['Add', 'Edit', 'Save', 'Delete', 'change']);
const events = new NodeList(['click', 'change']);
const tags = new NodeList(['main', 'section', 'label', 'input', 'button', 'img', 'h3', 'ul', 'div', 'li']);
const inputTypes = new NodeList(['text', 'checkbox']);
const taskClasses = new NodeList(['all', 'view', 'edit'], ['task', 'task-view', 'task-edit']).setMask('task-').setNextByName('view', 'edit').setNextByName('edit', 'view');
const classes = new NodeList(['taskList', 'inputNew', 'button', 'checkbox', 'label', 'task', 'buttonImage'], ['task-list', 'input-new', 'button', 'checkbox', 'label', 'task', 'button-image']);
const other = new NodeList(['deleteButtonSrc', 'textInput'], ['./button-delete.svg', '[type=text]']);

class DomElements{
  constructor(parent) {
    this.parent = parent;
  }
  addElement(element){
    if (element && element.hasOwnProperty(properties.nodeName.tag)) {
      this.element = document.createElement(element.tag);
      for (const [key, value] of Object.entries(element)) {
        if (key !== properties.nodeName.tag) this.element[key] = value;
      }
    }
    this.parent.appendChild(this.element); 
    return this;
  }
  setParent() {
    this.parent = this.element;
    return this;
  }
  setEvent(eventDetails) {
    if (eventDetails && eventDetails.hasOwnProperty(properties.nodeName.name)) {
      if (eventDetails.hasOwnProperty(properties.nodeName.function)) this.element.addEventListener(eventDetails.name, eventDetails.function);
      if (eventDetails.hasOwnProperty(properties.nodeName.action)) this.element.addEventListener(eventDetails.name, (event) => { actionTask(event.target, eventDetails.action) });
    }
    return this;
  }
}

function ajaxRequest() {
}

function createSections() {
  const main = document.getElementById(tags.nodeName.main);

  for (let index = 0; index < sections.getLength(); index++) {
     const domSection = new DomElements(main);
     const section = sections.setByIndex(index);
     const task = tasks.setByIndex(index);

     domSection.addElement({ tag: tags.nodeName.section, id: section.getId() })
       .setParent()
       .addElement({ tag: tags.nodeName.h3, innerText: section.getLabel(), className : tags.nodeName.h3})
       .addElement( {
         tag: ((section.getName() === section.nodeName.new) ? tags.nodeName.div : tags.nodeName.ul), 
         id: task.getId(),
         className: classes.nodeLabel.taskList });
  }
}

function getStatusFromTask(task){
  const index = (task.hasOwnProperty(properties.nodeName.completed)) ? (1 + +task.completed) : 0;
  return tasks.setByIndex(index).getName();
}

function createTask(newTask){
  const index = (newTask.hasOwnProperty(properties.nodeName.completed)) ? (1 + +newTask.completed) : 0;
  const task = tasks.setByIndex(index);
  const section = sections.setByIndex(index);

  const {text, completed, saved} = newTask;
  const taskContainer = document.getElementById(tasks.getId());
  const domElements = new DomElements(taskContainer);
  
  
  if (tasks.getName() === tasks.nodeName.new) {
    taskClasses.setByName(taskClasses.nodeName.all);
    domElements.addElement({ tag: tags.nodeName.input, className : classes.nodeLabel.inputNew, type: inputTypes.nodeName.text, value: text })
      .addElement({ tag: tags.nodeName.button, className: classes.nodeLabel.button, innerText: buttons.nodeLabel.add })
      .setEvent({ name: events.nodeName.click, action: actions.nodeName.add })
      .setEvent({ name: events.nodeName.click, function: ajaxRequest });
  } else {
    taskClasses.setByName(taskClasses.nodeName.view).setNext(saved);
    buttons.setByName(buttons.nodeName.save).setNext(saved);
    domElements.addElement({ tag:  tags.nodeName.li, className: taskClasses.getLabel() })
      .setParent()
      .addElement({ tag: tags.nodeName.input, className: classes.nodeLabel.checkbox, type: inputTypes.nodeName.checkbox, checked: completed })
      .setEvent({ name: events.nodeName.change, action: actions.nodeName.checkbox }) 
      .addElement({ tag: tags.nodeName.label, className: classes.nodeLabel.label, type: inputTypes.nodeName.text, innerText: text })
      .addElement({ tag: tags.nodeName.input, className: classes.nodeLabel.task, type: inputTypes.nodeName.text, value: text })
      .addElement({ tag: tags.nodeName.button, className: buttons.getClass(), innerText: buttons.getLabel() })
      .setEvent({ name: events.nodeName.click, action: actions.nodeName.edit }) 
      .addElement({ tag: tags.nodeName.button, className: buttons.nodeClass.delete })
      .setEvent({ name: events.nodeName.click, action: actions.nodeName.delete }) 
      .setParent()
      .addElement({ tag: tags.nodeName.img, className: classes.nodeLabel.buttonImage, src: other.nodeLabel.deleteButtonSrc });
  }
}

function updateInput(taskClass, [label, input]) {
  switch (taskClass){
    case taskClasses.nodeLabel.edit:
      label.innerText = input.value;
      break;
    case taskClasses.nodeLabel.view:
      input.value = label.innerText;
      break;
  }
}

function actionAdd(listItem) {
  const input = listItem.querySelector(tags.nodeName.input + other.nodeLabel.textInput);
  if (input.value) {
    createTask({text: input.value, completed: false, saved: true});
    input.value = '';
  }
}

function actionNextButton(listItem) {
  const label = listItem.querySelector(tags.nodeName.label);
  const input = listItem.querySelector(tags.nodeName.input + other.nodeLabel.textInput);
  const button = listItem.querySelector('.' + tags.nodeName.button);
  const className = listItem.classList.value;
  
  updateInput(className, [label, input]);
  button.innerText = buttons.setByName(String(button.innerText).toLowerCase()).setNext(true).getLabel();
  listItem.classList.value = taskClasses.setByName(String(className).replace(taskClasses.getMask(), '')).setNext(true).getLabel();
}

function actionDelete(list) {
  list?.remove();
}

function actionNextStatus(list, listItem) {
  const status = list?.id?.replace(tasks.getMask(), '');
  document.getElementById(tasks.setByName(status).setNext(true).getId())?.appendChild(listItem);
}

function actionTask(task, action) {
  const listItem = task?.parentNode;
  const list = listItem?.parentNode;
  switch (action) {
    case actions.nodeName.add:
      actionAdd(listItem);
      break;
    case actions.nodeName.edit:
      actionNextButton(listItem);
      break;
    case actions.nodeName.delete:
      actionDelete(list);
      break;
    case actions.nodeName.checkbox:
      actionNextStatus(list, listItem)
      break;
  }   
}

function loadTasks() {
  for (let task of DEFAULT_TASKS) {
    createTask(task);
  }
}

createSections();
loadTasks();
