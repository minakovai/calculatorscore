const form = document.getElementById('health-form');
const result = document.getElementById('result');
const errorBox = document.getElementById('error');
const fillDemoBtn = document.getElementById('fill-demo');

const bmiValue = document.getElementById('bmi-value');
const bmiText = document.getElementById('bmi-text');
const bmrValue = document.getElementById('bmr-value');
const tdeeValue = document.getElementById('tdee-value');
const scoreValue = document.getElementById('score-value');
const scoreText = document.getElementById('score-text');
const scoreCard = document.querySelector('.metric--score');
const jokeBox = document.getElementById('joke');

const demoData = {
  sex: 'female',
  age: 29,
  height: 168,
  weight: 62,
  waist: 74,
  bpSystolic: 118,
  bpDiastolic: 76,
  activity: 1.55,
};

const toNum = (value) => Number.parseFloat(value);

const bmiCategory = (bmi) => {
  if (bmi < 18.5) return 'Недостаточная масса';
  if (bmi < 25) return 'Нормальный диапазон';
  if (bmi < 30) return 'Избыточная масса';
  return 'Ожирение';
};

const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

const getScoreInfo = (score) => {
  if (score >= 80) return { level: 'good', text: 'Отличный показатель. Продолжайте в том же духе.' };
  if (score >= 60) return { level: 'warn', text: 'Хорошо, но есть зоны для улучшения.' };
  return { level: 'bad', text: 'Стоит пересмотреть питание, сон и нагрузку.' };
};

const validate = ({ age, height, weight, waist, bpSystolic, bpDiastolic }) => {
  if ([age, height, weight, waist, bpSystolic, bpDiastolic].some((v) => Number.isNaN(v))) {
    return 'Заполните все поля корректными числами.';
  }
  if (age < 14 || age > 100) return 'Возраст должен быть от 14 до 100 лет.';
  if (height < 120 || height > 230) return 'Рост должен быть от 120 до 230 см.';
  if (weight < 35 || weight > 250) return 'Вес должен быть от 35 до 250 кг.';
  if (waist < 45 || waist > 180) return 'Обхват талии должен быть от 45 до 180 см.';
  if (bpSystolic < 80 || bpSystolic > 240) return 'Систолическое давление должно быть от 80 до 240 мм рт. ст.';
  if (bpDiastolic < 50 || bpDiastolic > 150) return 'Диастолическое давление должно быть от 50 до 150 мм рт. ст.';
  if (bpSystolic <= bpDiastolic) return 'Систолическое давление должно быть выше диастолического.';
  return '';
};

const calculate = ({ sex, age, height, weight, waist, bpSystolic, bpDiastolic, activity }) => {
  const heightM = height / 100;
  const bmi = weight / (heightM ** 2);

  const bmr = sex === 'male'
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;

  const tdee = bmr * activity;

  const bmiPenalty = Math.abs(bmi - 22) * 5;
  const waistToHeight = waist / height;
  const waistPenalty = Math.max(0, (waistToHeight - 0.5) * 180);
  const agePenalty = Math.max(0, age - 45) * 0.7;
  const bpPenalty = Math.max(0, bpSystolic - 120) * 0.55 + Math.max(0, bpDiastolic - 80) * 0.85;

  const rawScore = 100 - bmiPenalty - waistPenalty - agePenalty - bpPenalty;
  const score = Math.round(clamp(rawScore, 0, 100));

  return {
    bmi,
    bmr,
    tdee,
    score,
    bmiLabel: bmiCategory(bmi),
  };
};

const getJoke = (score) => {
  if (score >= 80) return 'Ваш организм аплодирует стоя. Главное — не сбить пульс от гордости 😄';
  if (score >= 60) return 'Неплохо! Тело говорит: «Еще чуть-чуть, и дадим премию в виде энергии».';
  return 'Пора прокачать режим — холодильник не должен быть вашим фитнес-тренером 😅';
};

const renderResult = (data) => {
  bmiValue.textContent = data.bmi.toFixed(1);
  bmiText.textContent = data.bmiLabel;
  bmrValue.textContent = Math.round(data.bmr).toLocaleString('ru-RU');
  tdeeValue.textContent = Math.round(data.tdee).toLocaleString('ru-RU');
  scoreValue.textContent = `${data.score}/100`;

  const info = getScoreInfo(data.score);
  scoreText.textContent = info.text;

  scoreCard.classList.remove('good', 'warn', 'bad');
  scoreCard.classList.add(info.level);
  jokeBox.textContent = getJoke(data.score);

  result.hidden = false;
};

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const values = {
    sex: formData.get('sex'),
    age: toNum(formData.get('age')),
    height: toNum(formData.get('height')),
    weight: toNum(formData.get('weight')),
    waist: toNum(formData.get('waist')),
    bpSystolic: toNum(formData.get('bpSystolic')),
    bpDiastolic: toNum(formData.get('bpDiastolic')),
    activity: toNum(formData.get('activity')),
  };

  const validationMessage = validate(values);
  if (validationMessage) {
    errorBox.textContent = validationMessage;
    result.hidden = true;
    return;
  }

  errorBox.textContent = '';
  renderResult(calculate(values));
});

form.addEventListener('reset', () => {
  errorBox.textContent = '';
  result.hidden = true;
  jokeBox.textContent = '';
});

fillDemoBtn.addEventListener('click', () => {
  Object.entries(demoData).forEach(([key, value]) => {
    const input = form.elements.namedItem(key);
    if (input) input.value = value;
  });

  errorBox.textContent = '';
});
