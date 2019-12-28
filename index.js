const showValue = obj => {
  const textRange = document.querySelector('.text-range');
  textRange.style.left = `${parseInt(obj.value, 10) * 10.42}px`;
  textRange.innerHTML = obj.value;
};

const resetBody = el => {
  const container = document.querySelector(`${el} .body`);
  container.innerHTML = '';
};

const resetAllBody = () => {
  const container = document.querySelector('.body');
  container.innerHTML = '';
};

const loading = status => {
  const loading = document.querySelector('.loading');
  const container = document.querySelector('.container');
  loading.classList[!status ? 'remove' : 'add']('show');
  container.classList[!status ? 'remove' : 'add']('lock');
};

const activateButton = status => {
  const button = document.querySelectorAll('button');
  Object.values(button).forEach(btn => {
    btn.classList[status ? 'remove' : 'add']('disabled');
  })
};

const init = () => {
  document.querySelector("#image").onchange = evt => {
    let reader = new FileReader();
    reader.readAsDataURL(evt.target.files[0]);
    reader.onload = () => {
      resetAllBody();
      const img = document.querySelector('#imgPreview');
      img.setAttribute('src', reader.result);
      img.classList.remove('hide');
      document.querySelector('label[for=classify]').innerText = document.querySelector('input[type=file]').files[0].name;
      activateButton(true);
    };
  }
};

const renderResult = arr => {
  const ul = document.createElement('ul');
  arr.forEach((data, index) => {
    debugger;
    const li = document.createElement('li');
    const className = document.createElement('span');
    const probability = document.createElement('progress');
    className.setAttribute('class', 'classify-text')
    className.innerHTML = `${index + 1}. - ${data.className || data.class} ${data.class && data.type_hierarchy ? '(' + data.type_hierarchy + ')' : ''}`;
    probability.setAttribute('class', 'classify-text');
    probability.value = data.probability ? data.probability * 100 : data.score * 100;
    probability.max = 100;
    probability.setAttribute('data-value', `${parseFloat(data.probability ? data.probability * 100 : data.score * 100).toFixed(4)}%`);
    li.appendChild(className);
    li.appendChild(probability);
    ul.appendChild(li);
  });
  return ul;
};

const tensorflowObjectDetection = msn => {
  loading(true);
  resetBody('.tensorflow');
  const img = document.getElementById('imgPreview');
  mobilenet.load().then(model => {
    const totalClasses = parseInt(document.querySelector('#slider').value, 10);
    model.classify(img, totalClasses).then(predictions => {
      loading(false);
      const container = document.querySelector('.tensorflow .body');
      const predictionsOrder = predictions.sort((a, b) => a.probability > b.probability ? -1 : 1);
      const result = renderResult(predictionsOrder);
      container.appendChild(result);
    });
  });
};

const IBMWatsonObjectDetection = () => {
  loading(true);
  resetBody('.ibm-watson');
  debugger;
  const url = new URL('http://localhost:3000/ibm-watson');
  const params = { file: document.querySelector('input[type=file]').files[0].name };
  Object.keys(params).forEach(data => url.searchParams.append(data, params[data]));
  fetch(url).then(response => response.json()).then(responseJson => {
    loading(false);
    const { images } = responseJson;
    const { classifiers } = images[0];
    const { classes } = classifiers[0];
    debugger;
    const container = document.querySelector('.ibm-watson .body');
    const classesOrder = classes.sort((a, b) => a.score > b.score ? -1 : 1);
    const result = renderResult(classesOrder);
    container.appendChild(result);
  });
};

window.onload = init();