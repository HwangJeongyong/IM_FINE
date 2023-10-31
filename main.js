/* data는 
    {
        id: string,
        value: number
    }
    객체의 배열 형태를 취함
 */
let data = [];

const inputForm = document.getElementById("add-form");
const inputId = document.getElementById("add-id");
const inputValue = document.getElementById("add-value");

const graphList = document.getElementById("graph-list");
const editorList = document.getElementById("editor-list");
const jsonEditor = document.getElementById("jsonEditor");

const hrDiv = document.getElementById("horizon-line");

// 3. 값 추가 에서 id, value를 입력받아 data에 추가 후 연관된 컴포넌트에 반영
function addValue(event) {
  event.preventDefault(); // form태그 새로고침 방지
  const id = inputId.value;
  let value = inputValue.value;

  // id, value 유효성 검사
  if ((id === "") | (value === "")) {
    alert("ID 또는 VALUE를 입력해주세요.");
    return;
  }

  // value가 빈 문자열일 경우 0으로 바뀌기 때문에 검사 후 변환
  value = Number(inputValue.value);

  if (data.find((item) => item.id == id)) {
    alert("중복되는 ID가 존재합니다.");
    return;
  } else if ((value < 0) | (value > 100)) {
    alert("0부터 100까지의 VALUE를 입력해주세요.");
    return;
  } else if (isNaN(value)) {
    alert("VALUE는 숫자만 가능합니다.");
    return;
  }

  addData(id, value);

  // input태그 value값 초기화
  inputId.value = "";
  inputValue.value = "";

  // 고급 값 편집 textarea에 반영
  jsonEditor.value = jsonToStr(data);
}

// form태그에서 submit시 addValue 실행
inputForm.addEventListener("submit", addValue);

function addData(id, value) {
  // data에 입력된 값 추가
  data.push({ id: id, value: value });

  const itemDiv = createGraph(id, value);
  const row = createRow(id, value);
  graphList.appendChild(itemDiv);
  editorList.appendChild(row);

  // 막대 그래프 개수가 변경되면 x축 길이 조정
  const index = data.length;
  hrDiv.style.width = index < 6 ? "550px" : `${100 * index}px`;
}

// 막대그래프 생성 후 반환
function createGraph(id, value) {
  const itemDiv = document.createElement("div");
  const valueDiv = document.createElement("div"); // 막대그래프 div태그
  const idDiv = document.createElement("div"); // ID div태그

  itemDiv.className = "graph-item";

  valueDiv.id = `graph-value-${id}`;
  valueDiv.className = "graph-item-value";
  valueDiv.style.height = `${5 * value}px`; // value 0~100 -> 막대그래프 높이 0~500px 변환

  idDiv.id = `graph-id-${id}`;
  idDiv.className = "graph-item-id";
  idDiv.innerText = id;

  itemDiv.appendChild(valueDiv);
  itemDiv.appendChild(idDiv);

  return itemDiv;
}

// 값 편집 테이블의 행 생성 후 반환
function createRow(id, value) {
  const row = document.createElement("div");
  const idDiv = document.createElement("div"); // ID 값 div태그
  const valueInput = document.createElement("input"); // 편집 VALUE input태그
  const removeBtn = document.createElement("button"); // 행 삭제 button태그

  // 값 변경시 그래프 높이 바꾸기
  valueInput.addEventListener("input", (e) => { 
    const graphDiv = document.getElementById(`graph-value-${id}`);
    valueInput.value = e.target.value
    graphDiv.style.height = `${5 * valueInput.value}px`;
  })

  row.className = "editor-row";

  idDiv.id = `editor-id-${id}`;
  idDiv.innerText = id;

  valueInput.id = `editor-value-${id}`;
  valueInput.value = value;

  removeBtn.textContent = "삭제";
  removeBtn.addEventListener("click", removeValue);

  row.appendChild(idDiv);
  row.appendChild(valueInput);
  row.appendChild(removeBtn);

  return row;
}

// 값 편집 Apply 클릭 시 실행
function editValue() {
  let valueList = [];

  for (let i = 0; i < data.length; i++) {
    const valueInput = document.getElementById(`editor-value-${data[i].id}`);
    const value = Number(valueInput.value);

    // VALUE 유효성 검사
    if ((value < 0) | (value > 100)) {
      alert("0부터 100까지의 VALUE를 입력해주세요.");
      return;
    } else if (isNaN(value)) {
      alert("VALUE는 숫자만 가능합니다.");
      return;
    }

    valueList.push(value);
  }

  data.forEach((item, index) => {
    item.value = valueList[index]; // 변경된 VALUE data에 반영
    const valueGraph = document.getElementById(`graph-value-${item.id}`);
    valueGraph.style.height = `${5 * valueList[index]}px`; // 변경된 VALUE 그래프에 반영
  });

  jsonEditor.value = jsonToStr(data);
}

// 값 편집 삭제 button 클릭시 실행
function removeValue(e) {
  const row = e.target.parentElement; // 삭제 button이 포함된 행 div
  const id = row.firstChild.innerText; // 행에 대응되는 id
  const removedIndex = data.findIndex((item) => item.id === id); // 삭제할 행의 index
  row.remove();
  graphList.childNodes[removedIndex].remove();

  data = data.filter((item) => item.id != id);

  const index = data.length;
  hrDiv.style.width = index < 6 ? "550px" : `${100 * index}px`;

  jsonEditor.value = jsonToStr(data);
}

// 입력받은 텍스트를 객체로 변환 후 컴포넌트에 반영
function jsonUpdate() {
  const str = jsonEditor.value;
  const newData = strToJson(str); // 값 고급 편집의 텍스트를 객체로 변환
  if (!newData | !validateJson(newData)) return; // 유효성 검사
  data = newData;
  replaceData(data);

  jsonEditor.value = jsonToStr(data);
}

// 변경된 데이터 그래프, 값편집에 반영
function replaceData(data) { 
  let newGraphs = [];
  let newRows = [];
  data.forEach((item) => {
    const { id, value } = item;
    newGraphs.push(createGraph(id, value));
    newRows.push(createRow(id, value));
  });
  graphList.replaceChildren(...newGraphs); // 변경된 data로 그래프 교체
  editorList.replaceChildren(...newRows); // 변경된 data로 값 편집 교체
}

// data 객체를 문자열 형태로 변환 후 반환
function jsonToStr(data) {
  if (data.length === 0) return ""; // data가 비어있을 때

  let str = "[";
  data.forEach((item) => {
    str += "\n {";
    Object.entries(item).forEach((element) => {
      const key = `"${element[0]}"`;
      const value =
        typeof element[1] === "string" ? `"${element[1]}"` : `${element[1]}`;
      str += `\n  ${key}: ${value},`;
    });

    str = str.slice(0, -1); // 마지막 괄호 뒤 "," 제거
    str += "\n },";
  });

  str = str.slice(0, -1); // 마지막 괄호 뒤 "," 제거
  str += "\n]";

  return str;
}

// 값 고급 편집에서 받은 문자열을 객체로 변환 후 반환
function strToJson(str) {
  try {
    const newData = JSON.parse(str);
    return newData;
  } catch (e) {
    alert("{\n id: 문자열,\n value: 숫자\n}\n형식에 맞게 입력해주세요.");
  }
}

// 변환된 객체 유효성 검사
function validateJson(newData) {
  for (let i = 0; i < newData.length; i++) {
    const keys = Object.keys(newData[i]).length;
    const { id, value } = newData[i];
    if (!id | !value | (keys !== 2) | (id == "")) {
      alert("{\n id: 문자열,\n value: 숫자\n}\n형식에 맞게 입력해주세요.");
      return false;
    } else if ((value < 0) | (value > 100)) {
      alert("0부터 100까지의 VALUE를 입력해주세요.");
      return false;
    } else if (isNaN(value) | (typeof value === "string")) {
      alert("VALUE는 숫자만 가능합니다.");
      return false;
    } else if (
      newData.filter((item) => item.id !== id).length !==
      newData.length - 1
    ) {
      alert("중복되는 ID가 존재합니다.");
      return false;
    }
  }
  return true;
}

// 오름차순 정렬
function sortAsc() { 
  data = data.sort(function (a, b) {
    if (a.value > b.value) {
      return 1;
    }
    if (a.value < b.value) {
      return -1;
    }
    return 0;
  })
  replaceData(data);
}

// 내림차순 정렬
function sortDsc() { 
  data = data.sort(function (a, b) {
    if (a.value < b.value) {
      return 1;
    }
    if (a.value > b.value) {
      return -1;
    }
    return 0;
  })
  replaceData(data);
}
