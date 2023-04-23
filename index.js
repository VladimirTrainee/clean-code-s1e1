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

const BUTTON_ADD = 'Add';
const BUTTON_EDIT = 'Edit';
const BUTTON_SAVE = 'Save';
const BUTTON_DELETE = 'Delete';
const BUTTON_STATUSES = {
  [BUTTON_ADD]: { next: [BUTTON_EDIT]}, 
  [BUTTON_EDIT]: { next: [BUTTON_SAVE]}, 
  [BUTTON_SAVE]: { next: [BUTTON_EDIT]}, 
  [BUTTON_DELETE]: { next: [BUTTON_ADD]}
};

const TASK_STATUS_NEW = 'new';
const TASK_STATUS_INCOMPLETE = 'incomplete';
const TASK_STATUS_COMPLETE = 'complete';
const TASK_STATUSES = {
  [TASK_STATUS_NEW]: { label: 'Add Item', next: [TASK_STATUS_INCOMPLETE]},
  [TASK_STATUS_INCOMPLETE]: { label: 'Todo', next: [TASK_STATUS_COMPLETE]},
  [TASK_STATUS_COMPLETE]: { label:'Completed', next: [TASK_STATUS_INCOMPLETE]}
};

const ACTION_ADD = BUTTON_ADD.toUpperCase();
const ACTION_EDIT = BUTTON_EDIT.toUpperCase();
const ACTION_SAVE = BUTTON_SAVE.toUpperCase();
const ACTION_DELETE = BUTTON_DELETE.toUpperCase();
const ACTION_NEXT_BUTTON = 'NEXT_BUTTON';
const ACTION_NEXT_STATUS = 'NEXT_STATUS';

const DEFAULT_TASKS = [
    {text: ''},
    {text: 'Pay Bills', completed: false, saved: true},
    {text: 'Go Shopping', completed: false, saved: false},
    {text: 'See the Doctor', completed: true, saved: true}
];
const TAGS = ['main', 'section', 'label', 'input', 'button', 'img'];

// { MAIN: 'main', SECTION: 'section', LABEL: 'label', INPUT: 'input', BUTTON: 'button', IMG: 'img' };
// const PROPERTIES = { TAG: 'tag', NAME: 'NAME', FUNCTION: 'function', ACTION: 'action' }

class DomElements{
  constructor(parent) {
    this.parent = parent;
  }
  addElement(element){
    console.log(element.tag);
    if (element && element.hasOwnProperty('tag')) {
      this.element = document.createElement(element.tag);
      for (const [key, value] of Object.entries(element)){
        if (key !== 'tag') this.element[key] = value;
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
    if (eventDetails && eventDetails.hasOwnProperty('name')) {
      if (eventDetails.hasOwnProperty('function')) this.element.addEventListener(eventDetails.name, eventDetails.function);
      if (eventDetails.hasOwnProperty('action')) this.element.addEventListener(eventDetails.name, (event) => {actionTask(event.target, eventDetails.action)});
    }
    return this;
  }
}

createSections();
loadTasks();

function loadTasks(){
  for (let task of DEFAULT_TASKS){
    createTask(task);
  }
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
       .addElement( {tag:((status !== TASK_STATUS_NEW) ? 'ul' : 'div'), id: getTaskListId(status) });
  }
}

function getStatusFromTask(task){
  const index = (task.hasOwnProperty('completed')) ? (1 + +task.completed) : 0;
  const taskKeys = Object.keys(TASK_STATUSES);
  
  return (index >=0 && index < taskKeys.length) ? taskKeys[index] : null;
}

function createTask(newTask){
  const status = getStatusFromTask(newTask);
  if (status) {
    const buttonStatuses = Object.keys(BUTTON_STATUSES);
    const taskClasses = Object.keys(TASK_CLASSES);
    const {text, completed, saved} = newTask;
    const taskContainer = document.getElementById(getTaskListId(status));
    const domElements = new DomElements(taskContainer);
    if (status === TASK_STATUS_NEW) {
      domElements.addElement({ tag: TAGS.INPUT, className: getTaskListId(TAGS.INPUT), type: 'text', value: text })
        .addElement({ tag: TAGS.BUTTON, innerText: BUTTON_ADD, value: text })
        .setEvent({ name: 'click', action: ACTION_ADD })
        .setEvent({ name: 'click', function: ajaxRequest });
    } else {
      domElements.addElement({ tag: 'li', className: taskClasses[+saved] })
        .setParent()
        .addElement({ tag: TAGS.INPUT, type: 'checkbox', checked: completed })
        .setEvent({ name: 'change', action: ACTION_NEXT_STATUS }) 
        .addElement({ tag: TAGS.LABEL, className: getTaskListId(TAGS.INPUT), type: 'text', innerText: text })
        .addElement({ tag: TAGS.INPUT, className: getTaskListId(TAGS.INPUT), type: 'text', value: text })
        .addElement({ tag: TAGS.BUTTON, className: 'edit', innerText: buttonStatuses[1 + +!saved] })
        .setEvent({ name: 'click', action: ACTION_NEXT_BUTTON }) 
        .addElement({ tag: TAGS.BUTTON, className: 'delete' })
        .setEvent({ name: 'click', action: ACTION_DELETE }) 
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
  return (details && details.hasOwnProperty('next')) ? details.next : key;
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
  button.innerText = nextState(button.innerText, BUTTON_STATUSES);
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
  switch (action) {
    case ACTION_ADD:
      actionAdd(listItem);
      break;
    case ACTION_NEXT_BUTTON:
      actionNextButton(listItem);
      break;
    case ACTION_DELETE:
      actionDelete(list);
      break;
    case ACTION_NEXT_STATUS:
      actionNextStatus(list, listItem)
      break;
  }   
}
