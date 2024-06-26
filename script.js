let augmentedMsg = [];
let currentStepIndex=0;
let j=0;
let stepLog=[];
let isFirst;
document.getElementById('message').addEventListener('blur', updatePolynomials);
document.getElementById('generator').addEventListener('blur', updatePolynomials);

document.getElementById('crc-form').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
		isFirst = true;
        event.preventDefault();
        updatePolynomials();
    }
});

document.getElementById('prev-step').addEventListener('click', function() {
	const message = document.getElementById('message').value;
    const generator = document.getElementById('generator').value;
	if (j >= 0) {
		j--;
		updatePolynomials();
	}
});

document.getElementById('next-step').addEventListener('click', function() {
	const message = document.getElementById('message').value;
    const generator = document.getElementById('generator').value;
	if (j < stepLog.length-1) {
		j++;
		updatePolynomials();
	}
});

function updatePolynomials() {
    const message = document.getElementById('message').value;
    const generator = document.getElementById('generator').value;

    if (message) {
        document.getElementById('message-polynomial').textContent = `P(x) = ${toPolynomial(message)}`;
		currentStepIndex = message.length;
    }

    if (generator) {
        document.getElementById('generator-polynomial').textContent = `G(x) = ${toPolynomial(generator)}`;
    }

    if (message && generator) {
		
        const { quotient, remainder, steps } = calculateCRC(message, generator);
		
        displayResults(quotient, remainder, steps);
    }
}

function toPolynomial(binaryString) {
    const terms = [];
    const length = binaryString.length;
	
    for (let i = 0; i < length; i++) {
        if (binaryString[i] === '1') {
            const power = length - i - 1;
            terms.push(power === 0 ? '1' : `x^${power}`);
        }
    }
    return terms.join(' + ');
}

function calculateCRC(message, generator) {
    const msg = message.split('').map(Number);
    const gen = generator.split('').map(Number);
    
    const m = msg.length;
    const n = gen.length;
 
    augmentedMsg = [...msg, ...Array(n - 1).fill(0)];
    let steps = [];
	if(isFirst===true){
		stepLog = [];
		j=0;
	}
    steps.push(`Message:     ${message}`);
    steps.push(`Generator:   ${generator}`);
	steps.push('');
    steps.push(message + `<span class="fill">${Array(n - 1).fill(0).join('')}</span>` +  ' |' +`${Array(3).fill('x').join('')}`); //dovrei mettere il quoziente
	
	
	if(isFirst==false)
		currentStepIndex = stepLog[j]+1;
    for (let i = 0; i < currentStepIndex; i++) {
        if (augmentedMsg[i] === 1){
			let step=[];
			step = singleStep(i, msg, gen);
			//console.log(step + ' ' + currentStepIndex );
			steps = [...steps, ...step];
			if(isFirst==true){
				stepLog.push(i);
				j++;
			}
			
		}
    }
    if(isFirst===true) {
		j = j-1;
		isFirst = false;
	}
    const remainder = augmentedMsg.slice(m);
    const quotient = msg.map((bit, index) => augmentedMsg[index] !== bit ? 1 : 0);

    return { quotient, remainder, steps };
}

function singleStep(i, msg, gen){
	const m = msg.length;
    const n = gen.length;
	
	const resXOR = Array(augmentedMsg.length).fill(' '); //array per il singolo passaggio
	const step=[];
	let str = Array(i).fill(' ').join('')+gen.join('')+Array(m-i).fill(' ').join('')+'|';
	if(i==0)
		str+= Array(m+2).fill('-').join('');
	
    step.push(str);
	
	str = Array(i).fill(' ').join('')+Array(n).fill('-').join('')+Array(m-i).fill(' ').join('')+'|';
	 
    step.push(str);

	for (let j = 0; j < n; j++) {
		augmentedMsg[i + j] ^= gen[j]; 
		resXOR[i+j] = augmentedMsg[i + j];
	}
	
	for (let j = 0; j < n; j++) {
		if(augmentedMsg[i + j] == 0 && (i+j)<m){
			resXOR[i + j] = '.';
			resXOR[i+j+n] = augmentedMsg[i + j+n];
		}
		else
			break;
	}
	//console.log(step);
	
	if(i<(currentStepIndex-1))
		step.push(resXOR.join('')+  ' |');
	else
		step.push(resXOR.slice(0,m).join('')+"<span class='fill'>"+resXOR.slice(m).join('')+"</span>" );
		
	return step;
}



function displayResults(quotient, remainder, steps) {
    document.getElementById('quotient').textContent = quotient.join('');
    document.getElementById('remainder').textContent = remainder.join('');
    document.getElementById('final-message').textContent = `${document.getElementById('message').value}${remainder.join('')}`;
    document.getElementById('result').style.display = 'block';

	steps[3] = steps[3].replace('xxx', `<span class='light'> ${quotient.join('')}</span>`);

    document.getElementById('calculation-steps').innerHTML = steps.join('\n');
    //document.getElementById('steps').style.display = 'block';
}

