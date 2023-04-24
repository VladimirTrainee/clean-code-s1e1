class NodeList{
  constructor (names = [], labels = [], classes = []) {
    this.nameList = [...names];
    this.nextList = [...names].map((value, index) => index);
    this.labelList = [...labels];
    this.classList = [...classes];
    this.constant = Object.fromEntries(names.map((value) => [value, value]));
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
  getLabelByName(name) {
    const index = this.nameList.indexOf(name);
    return this.labelList[index];
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
    if (element && element.hasOwnProperty(properties.constant.tag)) {
      this.element = document.createElement(element.tag);
      for (const [key, value] of Object.entries(element)) {
        if (key !== properties.constant.tag) this.element[key] = value;
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
    if (eventDetails && eventDetails.hasOwnProperty(properties.constant.name)) {
      if (eventDetails.hasOwnProperty(properties.constant.function)) this.element.addEventListener(eventDetails.name, eventDetails.function);
      if (eventDetails.hasOwnProperty(properties.constant.action)) this.element.addEventListener(eventDetails.name, (event) => { actionTask(event.target, eventDetails.action) });
    }
    return this;
  }
}

function ajaxRequest() {
}

function createSections() {
  const main = document.getElementById(tags.constant.main);

  for (let index = 0; index < sections.getLength(); index++) {
     const domSection = new DomElements(main);
     const section = sections.setByIndex(index);
     const task = tasks.setByIndex(index);

     domSection.addElement({ tag: tags.constant.section, id: section.getId() })
       .setParent()
       .addElement({ tag: tags.constant.h3, innerText: section.getLabel(), className : tags.constant.h3})
       .addElement( {
         tag: ((section.getName() === section.constant.new) ? tags.constant.div : tags.constant.ul), 
         id: task.getId(),
         className: classes.setByName(classes.constant.taskList).getLabel() });
  }
}

function getStatusFromTask(task){
  const index = (task.hasOwnProperty(properties.constant.completed)) ? (1 + +task.completed) : 0;
  return tasks.setByIndex(index).getName();
}

function createTask(newTask){
  const index = (newTask.hasOwnProperty(properties.constant.completed)) ? (1 + +newTask.completed) : 0;
  const {text, completed, saved} = newTask;
  const taskContainer = document.getElementById(tasks.getId());
  const domElements = new DomElements(taskContainer);

  tasks.setByIndex(index);
  sections.setByIndex(index);
  
  if (tasks.getName() === tasks.constant.new) {
    taskClasses.setByName(taskClasses.constant.all);
    domElements.addElement({ tag: tags.constant.input, className : classes.setByName(classes.constant.inputNew).getLabel(), type: inputTypes.constant.text, value: text })
      .addElement({ tag: tags.constant.button, className: classes.setByName(classes.constant.button).getLabel(), innerText: buttons.setByName(buttons.constant.add).getLabel() })
      .setEvent({ name: events.constant.click, action: actions.constant.add })
      .setEvent({ name: events.constant.click, function: ajaxRequest });
  } else {
    taskClasses.setByName(taskClasses.constant.view).setNext(saved);
    buttons.setByName(buttons.constant.save).setNext(saved);
    domElements.addElement({ tag:  tags.constant.li, className: taskClasses.getLabel() })
      .setParent()
      .addElement({ tag: tags.constant.input, className: classes.setByName(classes.constant.checkbox).getLabel(), type: inputTypes.constant.checkbox, checked: completed })
      .setEvent({ name: events.constant.change, action: actions.setByName(actions.constant.checkbox).getName() }) 
      .addElement({ tag: tags.constant.label, className: classes.setByName(classes.constant.label).getLabel(), type: inputTypes.constant.text, innerText: text })
      .addElement({ tag: tags.constant.input, className: classes.setByName(classes.constant.task).getLabel(), type: inputTypes.constant.text, value: text })
      .addElement({ tag: tags.constant.button, className: buttons.getClass(), innerText: buttons.getLabel() })
      .setEvent({ name: events.constant.click, action: actions.setByName(actions.constant.edit).getName() }) 
      .addElement({ tag: tags.constant.button, className: buttons.setByName(buttons.constant.delete).getClass() })
      .setEvent({ name: events.constant.click, action: actions.setByName(actions.constant.delete).getName() }) 
      .setParent()
      .addElement({ tag: tags.constant.img, className: classes.setByName(classes.constant.buttonImage).getLabel(), src: other.setByName(other.constant.deleteButtonSrc).getLabel() });
  }
}

function updateInput(taskClass, [label, input]) {
  switch (taskClass){
    case taskClasses.setByName( taskClasses.constant.edit).getLabel():
      label.innerText = input.value;
      break;
    case taskClasses.setByName(taskClasses.constant.view).getLabel():
      input.value = label.innerText;
      break;
  }
}

function actionAdd(listItem) {
  const input = listItem.querySelector(tags.constant.input + other.setByName(other.constant.textInput).getLabel());
  if (input.value) {
    createTask({text: input.value, completed: false, saved: true});
    input.value = '';
  }
}

function actionNextButton(listItem) {
  const label = listItem.querySelector(tags.constant.label);
  const input = listItem.querySelector(tags.constant.input + other.setByName(other.constant.textInput).getLabel());
  const button = listItem.querySelector('.' + tags.constant.button);
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
    case actions.constant.add:
      actionAdd(listItem);
      break;
    case actions.constant.edit:
      actionNextButton(listItem);
      break;
    case actions.constant.delete:
      actionDelete(list);
      break;
    case actions.constant.checkbox:
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
