const canvas = document.querySelector('.matrix');
const context = canvas.getContext('2d');
let backgroundImage = new Image();

backgroundImage.onload = function() {
    // Call your draw function here so that the matrix effect is drawn over the image.
    setInterval(draw, 30);
}

backgroundImage.src = '/imgs/hero-sumerian.jpg';


canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const nums = '0123456789';

const alphabet = katakana + latin + nums;

const fontSize = 16;
const columns = canvas.width/fontSize;

const rainDrops = [];

for( let x = 0; x < columns; x++ ) {
	rainDrops[x] = 1;
}

const draw = () => {
    context.globalCompositeOperation = 'source-over';
    context.globalAlpha = 0.05; 
    context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    
    context.globalAlpha = 1;
    context.fillStyle = '#0F0';
    context.font = fontSize + 'px monospace';

    for(let i = 0; i < rainDrops.length; i++) {
        const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));

        context.fillStyle = (Math.random() < 0.5) ? '#457B9D' : '#E63946';     

        context.fillText(text, i*fontSize, rainDrops[i]*fontSize);

        if(rainDrops[i]*fontSize > canvas.height && Math.random() > 0.975){
            rainDrops[i] = 0;
        }
        rainDrops[i]++;
    }

    // Reset global alpha and composite operation to default for future drawings
    context.globalAlpha = 1;
    context.globalCompositeOperation = 'source-over';
};


setInterval(draw, 30);