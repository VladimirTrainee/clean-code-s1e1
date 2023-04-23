const SECTION_MASK = 'section-';
const getSectionId = (status) => `${SECTION_MASK}${status}`;
const TASK_MASK = 'task-';
const getTaskListId = (status) => `${TASK_MASK}${status}`;

const TASK_CLASS_VIEW = 'task-view';
const TASK_CLASS_EDIT = 'task-edit';
const TASK_CLASSES = {
  [TASK_CLASS_EDIT]: { next: [TASK_CLASS_VIEW]}, 
  [TASK_CLASS_VIEW]: { next: [TASK_CLASS_EDIT]}
};

// const BUTTON_ADD = 'Add';
// const BUTTON_EDIT = 'Edit';
// const BUTTON_SAVE = 'Save';
// const BUTTON_DELETE = 'Delete';
// const BUTTON_STATUSES = {
//   [BUTTON_ADD]: { next: [BUTTON_EDIT]}, 
//   [BUTTON_EDIT]: { next: [BUTTON_SAVE]}, 
//   [BUTTON_SAVE]: { next: [BUTTON_EDIT]}, 
//   [BUTTON_DELETE]: { next: [BUTTON_ADD]}
// };

const TASK_STATUS_NEW = 'new';
const TASK_STATUS_INCOMPLETE = 'incomplete';
const TASK_STATUS_COMPLETE = 'complete';
const TASK_STATUSES = {
  [TASK_STATUS_NEW]: { label: 'Add Item', next: [TASK_STATUS_INCOMPLETE]},
  [TASK_STATUS_INCOMPLETE]: { label: 'Todo', next: [TASK_STATUS_COMPLETE]},
  [TASK_STATUS_COMPLETE]: { label:'Completed', next: [TASK_STATUS_INCOMPLETE]}
};

// const ACTION_ADD = BUTTON_ADD.toUpperCase();
// const ACTION_EDIT = BUTTON_EDIT.toUpperCase();
// const ACTION_SAVE = BUTTON_SAVE.toUpperCase();
// const ACTION_DELETE = BUTTON_DELETE.toUpperCase();
// const ACTION_NEXT_BUTTON = 'NEXT_BUTTON';
// const ACTION_NEXT_STATUS = 'NEXT_STATUS';

const DEFAULT_TASKS = [
    {text: ''},
    {text: 'Pay Bills', completed: false, saved: true},
    {text: 'Go Shopping', completed: false, saved: false},
    {text: 'See the Doctor', completed: true, saved: true}
];
const TAGS = upperCaseObject(['main', 'section', 'label', 'input', 'button', 'img', 'h3', 'ul', 'div', 'li']);
const PROPERTIES = upperCaseObject(['tag', 'name', 'function', 'action', 'saved', 'completed', 'next']);
const EVENTS = upperCaseObject(['click', 'change']);
const INPUT_TYPES = upperCaseObject(['text', 'checkbox']);
const BUTTON_CLASSES = upperCaseObject(['edit', 'delete']);
const BUTTONS = upperCaseObject(['Add', ['Edit', 'Save'], ['Save', 'Edit'], 'Delete'], { label: true, next: true });
const ACTIONS = upperCaseObject(['Add', 'Edit', 'Save', 'Delete', 'NEXT_BUTTON', 'NEXT_STATUS'], { label: true });

 console.log(ACTIONS);

class DomElements{
  constructor(parent) {
    this.parent = parent;
  }
  addElement(element){
    console.log(element.tag);
    if (element && element.hasOwnProperty(PROPERTIES.TAG)) {
      this.element = document.createElement(element.tag);
      for (const [key, value] of Object.entries(element)){
        if (key !== PROPERTIES.TAG) this.element[key] = value;
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
    if (eventDetails && eventDetails.hasOwnProperty(PROPERTIES.NAME)) {
      if (eventDetails.hasOwnProperty(PROPERTIES.FUNCTION)) this.element.addEventListener(eventDetails.name, eventDetails.function);
      if (eventDetails.hasOwnProperty(PROPERTIES.ACTION)) this.element.addEventListener(eventDetails.name, (event) => {actionTask(event.target, eventDetails.action)});
    }
    return this;
  }
}


function transform(value, options) {
  const next = options.hasOwnProperty('next');
  let valuesOptions;
  if (Array.isArray(value)) {
    valuesOptions = [String(value[0]).toUpperCase(), {label: value[0], next: value[1]}];
  } else {
    if (next) {
      valuesOptions = [String(value).toUpperCase(), { label: value, next: value}];
    } else {
      valuesOptions = [String(value).toUpperCase(), { label: value}];
    }
  }
  
  return valuesOptions; 
}

function upperCaseObject(array, options) {
  return Object.fromEntries(array.map((value) => (options) ? transform(value, options) : [String(value).toUpperCase(), value]));
}

function ajaxRequest(){
  console.log('AJAX Request');
}

function createSections(){
  const main = document.getElementById(TAGS.MAIN);
  for (const [status, detail] of Object.entries(TASK_STATUSES)) {
     const domSection = new DomElements(main);
     domSection.addElement({ tag:TAGS.SECTION, id: getSectionId(status) })
       .setParent()
       .addElement({ tag:'h3', innerText: detail.label })
       .addElement( {tag:((status !== TASK_STATUS_NEW) ? TAGS.UL : TAGS.DIV), id: getTaskListId(status) });
  }
}

function getStatusFromTask(task){
  const index = (task.hasOwnProperty(PROPERTIES.COMPLETED)) ? (1 + +task.completed) : 0;
  const taskKeys = Object.keys(TASK_STATUSES);
  
  return (index >=0 && index < taskKeys.length) ? taskKeys[index] : null;
}

function createTask(newTask){
  const status = getStatusFromTask(newTask);
  if (status) {
    const buttonStatuses = Object.values(BUTTONS);
    const taskClasses = Object.keys(TASK_CLASSES);
    const {text, completed, saved} = newTask;
    const taskContainer = document.getElementById(getTaskListId(status));
    const domElements = new DomElements(taskContainer);
    if (status === TASK_STATUS_NEW) {
      domElements.addElement({ tag: TAGS.INPUT, className: getTaskListId(TAGS.INPUT), type: INPUT_TYPES.TEXT, value: text })
        .addElement({ tag: TAGS.BUTTON, innerText: BUTTONS.ADD.label, value: text })
        .setEvent({ name: EVENTS.CLICK, action: ACTIONS.ADD.label })
        .setEvent({ name: EVENTS.CLICK, function: ajaxRequest });
    } else {
      domElements.addElement({ tag: TAGS.LI, className: taskClasses[+saved] })
        .setParent()
        .addElement({ tag: TAGS.INPUT, type: INPUT_TYPES.CHECKBOX, checked: completed })
        .setEvent({ name: EVENTS.CHANGE, action: ACTIONS.NEXT_STATUS.label }) 
        .addElement({ tag: TAGS.LABEL, className: getTaskListId(TAGS.INPUT), type: INPUT_TYPES.TEXT, innerText: text })
        .addElement({ tag: TAGS.INPUT, className: getTaskListId(TAGS.INPUT), type: INPUT_TYPES.TEXT, value: text })
        .addElement({ tag: TAGS.BUTTON, className: BUTTON_CLASSES.EDIT, innerText: buttonStatuses[1 + +!saved].label })
        .setEvent({ name: EVENTS.CLICK, action: ACTIONS.NEXT_BUTTON.label }) 
        .addElement({ tag: TAGS.BUTTON, className: BUTTON_CLASSES.DELETE })
        .setEvent({ name: EVENTS.CLICK, action: ACTIONS.DELETE.label }) 
        .setParent()
        .addElement({ tag: TAGS.IMG, src: './button-delete.svg' });
    }
  }
}

function updateInput(taskClass, [label, input]){
  switch (taskClass){
    case TASK_CLASS_EDIT:
      label.innerText = input.value;
      break;
    case TASK_CLASS_VIEW:
      input.value = label.innerText;
      break;
  }
}

function nextState(key, dataKeys){
  const details = dataKeys[key];
  console.log('>>', dataKeys);
  return (details && details.hasOwnProperty(PROPERTIES.NEXT)) ? details.next : key;
}
function actionAdd(listItem) {
  const input = listItem.querySelector('input[type=text]');
  if (input.value) {
    createTask({text:input.value, completed:false, saved:true});
    input.value = '';
  }
}
function actionNextButton(listItem) {
  const label = listItem.querySelector(TAGS.LABEL);
  const input = listItem.querySelector('input[type=text]');
  const button = listItem.querySelector('.edit');
  const className = listItem.classList.value;
  
  updateInput(className, [label, input]);
  button.innerText = nextState(button.innerText, BUTTONS);
  listItem.classList.value = nextState(className, TASK_CLASSES);
}

function actionDelete(list) {
  list?.remove();
}

function actionNextStatus(list, listItem) {
  const status = list?.id?.replace(TASK_MASK, '');
  document.getElementById(getTaskListId(nextState(status, TASK_STATUSES)))?.appendChild(listItem);
}

function actionTask(task, action){
  const listItem = task?.parentNode;
  const list = listItem?.parentNode;
  console.log(action);
  switch (action) {
    case ACTIONS.ADD.label:
      actionAdd(listItem);
      break;
    case ACTIONS.NEXT_BUTTON.label:
      actionNextButton(listItem);
      break;
    case ACTIONS.DELETE.label:
      actionDelete(list);
      break;
    case ACTIONS.NEXT_STATUS.label:
      actionNextStatus(list, listItem)
      break;
  }   
}
function loadTasks(){
  for (let task of DEFAULT_TASKS){
    createTask(task);
  }
}

createSections();
loadTasks();