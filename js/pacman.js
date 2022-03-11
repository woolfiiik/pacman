document.addEventListener('DOMContentLoaded', function() {

    var Game = {
        OVER:false,
        SIZE_W: 21,
        SIZE_H: 22,
        SCORE:0,
        IMMORTALITY:false,
        IMPOSSIBLE_WAYS:['P','#','-','|'],
        PRISON_POSITION_X:null,
        PRISON_POSITION_Y:null,
        STATE:null,
        LEVEL:0,
    };

    var Ghosts = {
        NUM_OF_GHOSTS:5, //maximum of ghost 7
        GHOSTS: [],
        INTERVALS:[],
        CHECK_INTERVAL:null,
        GHOSTS_SETTINGS:[
          [8,9,'white'],   //position and color of first potencial ghost
          [12,9,'red'], 
          [8,13,'green'], 
          [12,13,'blue'], 
          [10,11,'yellow'],   
          [8,11,'orange'],
          [12,11,'purple'],
        ],
    };

    Ghosts.init = function (){
        for (let i = 0; i < this.NUM_OF_GHOSTS; i++) {
            this.GHOSTS[i] = new Ghost(this.GHOSTS_SETTINGS[i][0],this.GHOSTS_SETTINGS[i][1],this.GHOSTS_SETTINGS[i][2]);     
        }
        this.setIntervals();
        this.CHECK_INTERVAL = setInterval(function(){Game.check();},10);
    }
    var Player = {
        SPEED:150,
        START_POS_X:10,
        START_POS_Y:4,
        LAST_DIRECTION:null,
        DIRECTION:null,
        IMMORTALITY_TIMER:null,
        INVENTORY:[],
        INTERVAL:null,
        CONTINUOUS_MOVE:false,
    };

    var Sounds = {   
        POLK:new Audio("sounds/polk.wav"),
        STEP:new Audio("sounds/step.wav"),
        BG_SOUND:new Audio("sounds/bgSoundNew.wav"),
        STEP_WRONG:new Audio("sounds/stepWrong.wav"),
        DIES:new Audio("sounds/dies.wav"),
        OVER:new Audio("sounds/game_over.wav"),
        WIN:new Audio("sounds/win.wav"),
        PILL:new Audio("sounds/bell.wav"),
        PILL10:new Audio("sounds/pill10.wav"),
        DIE_MONSTER:new Audio("sounds/dieMonster.wav"),
        MONSTER_LAUGH:new Audio("sounds/monsterLaugh.wav"),
        SHUT_DOOR:new Audio("sounds/shutDoor.wav"),
        OPEN_DOOR:new Audio("sounds/openDoor.wav"),
        LOCK:new Audio("sounds/lock.wav"),
        DIAMOND:new Audio("sounds/diamond.wav"),
    };

    var Draw = {
        PUZZLE_SIZE:40,
        BACKGROUND:'black',
        context:null,
        SCORE_TITLE:null,
        
    };

    function Ghost(positionX, positionY,color) {
        this.SPEED = 500;          //original 600/800
        this.SUPER_SPEED=300;       //original 300/400
        this.NORMAL_SPEED=500;     //original 600/800
        this.SLOW_SPEED=1000;
        this.COLOR = color;
        this.START_POS_X = positionX;
        this.START_POS_Y = positionY;
        this.COORDINATES_X=0;
        this.COORDINATES_Y=0;
        this.POSSIBILITY = [];
        this.CURRENT_DIRECTION = null;
        this.SEE_PLAYER = false;
        this.PACMAN_DISTANCE = 0;
        this.IN_PRISON = false;
        this.FOLLOW_WAY=[];
        this.draw = function(){
            this.getCoordinates();
            Draw.ghost(this.COORDINATES_X,this.COORDINATES_Y,this.COLOR);
        };
        this.getCoordinates = function (){
            this.COORDINATES_X = this.START_POS_X*Draw.PUZZLE_SIZE + Draw.PUZZLE_SIZE/2;
            this.COORDINATES_Y = this.START_POS_Y*Draw.PUZZLE_SIZE + Draw.PUZZLE_SIZE/2;
        };
        this.checkSeePlayer = function () {
            var wallCount;
            var distance;
            this.SEE_PLAYER=false;
            
            if(this.START_POS_X==Player.START_POS_X){
                if(this.START_POS_Y>Player.START_POS_Y){
                    wallCount=0;
                    distance=0;
                    for (let i = Player.START_POS_Y; i <= this.START_POS_Y-1; i++) {
                        distance++;
                        if(Board.MAP[i][this.START_POS_X]=='#'||Board.MAP[i][this.START_POS_X]=='-'||Board.MAP[i][this.START_POS_X]=='|'){
                            wallCount++ 

                        }
                    }
                    if(wallCount==0){
                        this.SEE_PLAYER='left';
                        this.PACMAN_DISTANCE=distance;
                    }        
                }
                if(this.START_POS_Y<Player.START_POS_Y){
                    wallCount=0;
                    distance=0;
                    for (let i = this.START_POS_Y+1; i <=Player.START_POS_Y; i++) {
                        distance++;
                        if(Board.MAP[i][this.START_POS_X]=='#'||Board.MAP[i][this.START_POS_X]=='-'||Board.MAP[i][this.START_POS_X]=='|'){
                            wallCount++ 
                        }  
                        
                    }
                    if(wallCount==0){
                        this.SEE_PLAYER='right';
                        this.PACMAN_DISTANCE=distance;
                    }
                }
            }
            else if(this.START_POS_Y==Player.START_POS_Y){
                
                if(this.START_POS_X>Player.START_POS_X){
                    wallCount=0;
                    distance=0;
                    for (let i = Player.START_POS_X; i <= this.START_POS_X-1; i++) {
                        distance++;
                        if(Board.MAP[this.START_POS_Y][i]=='#'||Board.MAP[this.START_POS_Y][i]=='-'||Board.MAP[this.START_POS_Y][i]=='|'){
                            wallCount++
                        }
                    } 
                    if(wallCount==0){
                        this.SEE_PLAYER='up';
                        this.PACMAN_DISTANCE=distance;    
                    }       
                }
                if(this.START_POS_X<Player.START_POS_X){
                    wallCount=0;
                    distance=0;
                    for (let i = this.START_POS_X+1; i <=Player.START_POS_X ; i++) {
                        distance++;
                        if(Board.MAP[this.START_POS_Y][i]=='#'||Board.MAP[this.START_POS_Y][i]=='-'||Board.MAP[this.START_POS_Y][i]=='|'){
                            wallCount++
                        }  
                        
                    }
                    if(wallCount==0){
                        this.SEE_PLAYER='down';
                        this.PACMAN_DISTANCE=distance;
                    }
                }
            }
            else{
                this.SEE_PLAYER=false;
                
            }
            
        };

        this.findWay = function(x,y){
            finish = new Coordinates(x,y);
            start = new Coordinates(this.START_POS_X,this.START_POS_Y);
            this.FOLLOW_WAY = GetShortestWay(start,finish,Board.MAP,Game.IMPOSSIBLE_WAYS);  
            Sounds.playSound(Sounds.MONSTER_LAUGH,0.7);
        };

        this.move = function () {
            if(!this.IN_PRISON){
                this.checkSeePlayer();
                Draw.cellEnviroment(this.COORDINATES_X-Draw.PUZZLE_SIZE/2,this.COORDINATES_Y-Draw.PUZZLE_SIZE/2,'black');
                if(Board.MAP[this.START_POS_Y][this.START_POS_X]=='*'){
                    Draw.cellCoin(this.COORDINATES_X-Draw.PUZZLE_SIZE/2,this.COORDINATES_Y-Draw.PUZZLE_SIZE/2);
                }
                if(Board.MAP[this.START_POS_Y][this.START_POS_X]=='+'){
                    Draw.pill(this.COORDINATES_X-Draw.PUZZLE_SIZE/2,this.COORDINATES_Y-Draw.PUZZLE_SIZE/2);
                }
                if(Board.MAP[this.START_POS_Y][this.START_POS_X]=='K'){
                    Draw.key(this.COORDINATES_X-Draw.PUZZLE_SIZE/2,this.COORDINATES_Y-Draw.PUZZLE_SIZE/2);
                }
                if(Board.MAP[this.START_POS_Y][this.START_POS_X]=='D'){
                    Draw.diamond(this.COORDINATES_X-Draw.PUZZLE_SIZE/2,this.COORDINATES_Y-Draw.PUZZLE_SIZE/2);
                }
                var random;
                var speed;

                if(this.SEE_PLAYER!=false && !Game.IMMORTALITY){
                    this.FOLLOW_WAY=[];
                    Sounds.playSound(Sounds.MONSTER_LAUGH,0.7);
                    random=this.SEE_PLAYER;
                    this.CURRENT_DIRECTION=this.SEE_PLAYER;
                    speed=this.SUPER_SPEED; 
                }
                else if(this.PACMAN_DISTANCE>0 && !Game.IMMORTALITY){
                    speed=this.NORMAL_SPEED;  
                    random=this.CURRENT_DIRECTION;                     
                }
                else{
                    this.PACMAN_DISTANCE=0;
                    speed=this.NORMAL_SPEED;
                random =this.getRandomMove();
                }
                
                if(this.SPEED!=speed){
                    this.SPEED=speed;
                    Ghosts.setIntervals();
                }
                switch (random) {
                    case 'right':
                        this.START_POS_Y+=1;
                        break;
                    case 'left':
                        this.START_POS_Y-=1;
                        break;
                    case 'up':
                        this.START_POS_X-=1
                        break;
                    case 'down':
                        this.START_POS_X+=1;
                        break;
                
                    default:
                        break;
                }
                if(this.FOLLOW_WAY.length!==0){
                    this.START_POS_X = this.FOLLOW_WAY[0].x;
                    this.START_POS_Y = this.FOLLOW_WAY[0].y;
                    this.FOLLOW_WAY.shift();
                }
                this.draw(this.COORDINATES_X,this.COORDINATES_Y,this.COLOR);
                
            }
            if(this.PACMAN_DISTANCE>0){
                this.PACMAN_DISTANCE--; 
            }
        };

        this.getPossibleWays = function () {
                this.POSSIBILITY=[true,true,true,true];
                
            for (let i = 0; i < Game.IMPOSSIBLE_WAYS.length; i++) {
                if(Board.MAP[this.START_POS_Y-1][this.START_POS_X]==Game.IMPOSSIBLE_WAYS[i]){
                    this.POSSIBILITY[0]=false;
                }
                if(Board.MAP[this.START_POS_Y+1][this.START_POS_X]==Game.IMPOSSIBLE_WAYS[i]){
                    this.POSSIBILITY[1]=false;
                }
                if(Board.MAP[this.START_POS_Y][this.START_POS_X+1]==Game.IMPOSSIBLE_WAYS[i]){
                    this.POSSIBILITY[2]=false;
                }
                if(Board.MAP[this.START_POS_Y][this.START_POS_X-1]==Game.IMPOSSIBLE_WAYS[i]){
                    this.POSSIBILITY[3]=false;
                }
            }
            
        };

        this.getRandomMove = function(){
            this.getPossibleWays();
            var newDirection=['left','right','down','up'];
            var opositeDirection=[];
            opositeDirection['right']='left';
            opositeDirection['left']='right';
            opositeDirection['up']='down';
            opositeDirection['down']='up';
            var direction=null;
            var state = false;
            
            while (state==false){
                var counter=0;
                do{
                    x=Math.floor(Math.random() * 4);   
                    counter++;
                }while((opositeDirection[this.CURRENT_DIRECTION]==newDirection[x]) && counter<5)
                if(this.POSSIBILITY[x]==true){
                    state = true;
                }
            }
                
                switch (x) {
                    case 0:
                        direction='left';
                        break;
                    case 1:
                        direction='right';
                        break;
                    case 2:
                        direction='down';
                        break;
                    case 3:
                        direction='up';
                        break;                
                    default:
                        break;
                }
                this.CURRENT_DIRECTION=direction;
            return direction;
        };
        this.draw();
    }

    Draw.init = function () {
        body = document.querySelector('body');
        canvas = document.createElement('canvas'); 
        canvas.width = Game.SIZE_W * this.PUZZLE_SIZE;
        canvas.height = Game.SIZE_H * this.PUZZLE_SIZE;
        this.context = canvas.getContext('2d');
        document.body.appendChild(canvas);
        
    }

    Draw.inventoryText = function () {
        this.context.fillStyle= 'black';
        this.context.font = '25px arial';
        this.context.fillText('INVENTORY: ',this.PUZZLE_SIZE*Game.SIZE_W/1.6,this.PUZZLE_SIZE/1.2);
    }

    Draw.levelText = function () {
        this.context.fillStyle= 'black';
        this.context.font = '25px arial';
        var level=Game.LEVEL+1;
        Player.DIRECTION = null;
        this.context.fillText('LEVEL: '+level,this.PUZZLE_SIZE*Game.SIZE_W/2.5,this.PUZZLE_SIZE/1.2);
    }

    Draw.scoreText = function () {
        for (let i = 0; i < 8; i++) {
            x = i* this.PUZZLE_SIZE;
        //y = j* this.PUZZLE_SIZE;
            Draw.cellEnviroment(x,0,'gray');
            
        }
        this.context.fillStyle= 'black';
        this.context.font = '25px arial';
        this.context.fillText('SCORE: '+Game.SCORE,this.PUZZLE_SIZE,this.PUZZLE_SIZE/1.2);
    }

    Draw.updateInventory= function () {
        var inventory =0;
        for (let i = Game.SIZE_W-4; i < Game.SIZE_W-1; i++) {
            x = i* this.PUZZLE_SIZE;
        //y = j* this.PUZZLE_SIZE;
            Draw.box(x,0);
            switch (Player.INVENTORY[inventory]) {
                case 'K':
                    Draw.key(x,0);
                    break;
            
                default:
                    Draw.box(x,0);
                    break;
            }  
            inventory++;  
        }
    }

    Draw.all = function () {
        var x= (Player.START_POS_X*this.PUZZLE_SIZE)+this.PUZZLE_SIZE/2;
        var y= (Player.START_POS_Y*this.PUZZLE_SIZE)+this.PUZZLE_SIZE/2;
        this.context.fillStyle = "#000";
        this.context.fillRect(0,0,this.context.canvas.width,this.context.canvas.height);
        this.cells(); 
        this.inventoryText();
        this.levelText();
        this.scoreText();
        this.pacman(x,y,'right');
    }

    Draw.cells = function () {
        for (let i = 0; i < Game.SIZE_W; i++) {
            for (let j = 0; j < Game.SIZE_H; j++) {
                Draw.cell(i,j);
            }         
        }
    }

    Draw.firstPage =function () {
        Draw.blankWindow();
        this.context.fillStyle = 'Black';
        this.context.font = '48px serif';
        this.context.fillText('PACMAN - The Ghosts Hour',this.PUZZLE_SIZE*(Game.SIZE_W/7),this.PUZZLE_SIZE*(Game.SIZE_W/3.5));
        this.context.fillStyle = 'White';
        this.context.font = '25px Helvetica';
        this.context.fillText('Press S to START',this.PUZZLE_SIZE*(Game.SIZE_W/2.9),this.PUZZLE_SIZE*(Game.SIZE_W/2.6));
        this.context.fillStyle = 'White';
        this.context.font = '22px italy Helvetica';
        this.context.fillText('"The ghosts are watching you! Be careful..."',this.PUZZLE_SIZE*(Game.SIZE_W/4.5),this.PUZZLE_SIZE*(Game.SIZE_W/1.25));
        this.context.font = '14px  Helvetica';
        this.context.fillText('Created by Jan Fillo / 2022 - ENJOY GAME!',this.PUZZLE_SIZE*(Game.SIZE_W/3.5),this.PUZZLE_SIZE*(Game.SIZE_W/1.1));
        var x= this.PUZZLE_SIZE*Game.SIZE_H/2.4;
        var y= this.PUZZLE_SIZE*Game.SIZE_H/1.8;
        var radius = this.PUZZLE_SIZE*Game.SIZE_H/9;
        const angle = Math.PI/180;
        this.context.beginPath();
        this.context.strokeStyle = 'yellow';
        this.context.fillStyle='yellow';
        this.context.arc(x,y,radius,angle*30,angle*330,false);
        this.context.lineTo(x,y);       
        this.context.closePath();    
        this.context.stroke();
        this.context.fill();

        this.circle(x+radius/3,y-radius/2,this.PUZZLE_SIZE/2.5,0,2 * Math.PI,'white');
        this.circle(x+radius/3,y-radius/2,this.PUZZLE_SIZE/8,0,2 * Math.PI,'black');
        this.circle(x+radius*1.2,y+radius/8,this.PUZZLE_SIZE/2.1,0,2 * Math.PI,'orange');
        this.circle(x+radius*2,y+radius/8,this.PUZZLE_SIZE/2.1,0,2 * Math.PI,'orange');
        this.circle(x+radius*2.8,y+radius/8,this.PUZZLE_SIZE/2.1,0,2 * Math.PI,'orange');
    }

    Draw.gameOver = function (){
        Draw.blankWindow();
        this.context.fillStyle = 'white';
        this.context.font = '48px serif';
        this.context.fillText('GAME OVER',this.PUZZLE_SIZE*(Game.SIZE_W/3),this.PUZZLE_SIZE*(Game.SIZE_W/3.5));
        this.context.font = '25px serif';
        this.context.fillText('Refresh the WebPage...(F5)',this.PUZZLE_SIZE*(Game.SIZE_W/2.9),this.PUZZLE_SIZE*(Game.SIZE_W/2.6));
        this.context.font = '35px serif';
        this.context.fillText('Your Score: '+Game.SCORE,this.PUZZLE_SIZE*(Game.SIZE_W/2.8),this.PUZZLE_SIZE*(Game.SIZE_W/3));
    }

    Draw.gameWin = function (){
        Draw.blankWindow();
        this.context.fillStyle = 'white';
        this.context.font = '48px serif';
        this.context.fillText('YOU WON THE GAME!',this.PUZZLE_SIZE*(Game.SIZE_W/5.2),this.PUZZLE_SIZE*(Game.SIZE_W/3.5));
        this.context.font = '25px serif';
        this.context.fillText('Refresh the WebPage...(F5)',this.PUZZLE_SIZE*(Game.SIZE_W/3.6),this.PUZZLE_SIZE*(Game.SIZE_W/2.6));
        this.context.font = '35px serif';
        this.context.fillText('Your Score: '+Game.SCORE,this.PUZZLE_SIZE*(Game.SIZE_W/3.6),this.PUZZLE_SIZE*(Game.SIZE_W/3));
    }

    Draw.blankWindow = function () {
        for (let i = 0; i < Game.SIZE_W; i++) {
            for (let j = 0; j < Game.SIZE_H; j++) {
                x = i* this.PUZZLE_SIZE;
                y = j* this.PUZZLE_SIZE;
                this.cellEnviroment(x,y,"gray");
            }         
        }
    }
    
    Draw.key = function (x,y) {
        this.context.beginPath();
        this.context.shadowColor='white';
        this.context.shadowBlur = 2;
        this.context.fillStyle = 'white';
        this.context.arc(x + this.PUZZLE_SIZE/2, y + this.PUZZLE_SIZE/2.5, this.PUZZLE_SIZE/6, 0, 2 * Math.PI);
        this.context.closePath();
        this.context.stroke();
        this.context.fill();
        this.context.fillRect(x + this.PUZZLE_SIZE/2.3, y + this.PUZZLE_SIZE/2.5, this.PUZZLE_SIZE/9,this.PUZZLE_SIZE/2.1);
        this.context.fillRect(x + this.PUZZLE_SIZE/2.1, y + this.PUZZLE_SIZE/1.6, this.PUZZLE_SIZE/9,this.PUZZLE_SIZE/9);
        this.context.fillRect(x + this.PUZZLE_SIZE/2.3, y + this.PUZZLE_SIZE/1.3, this.PUZZLE_SIZE/6,this.PUZZLE_SIZE/10);
        this.context.shadowColor=0;
        this.context.shadowBlur = 0;
        this.context.beginPath();
        this.context.fillStyle = 'gray';
        this.context.arc(x + this.PUZZLE_SIZE/2, y + this.PUZZLE_SIZE/2.5, this.PUZZLE_SIZE/15, 0, 2 * Math.PI);
        this.context.closePath();
        this.context.stroke();
        this.context.fill();
    }

    Draw.diamond = function (x,y) {
        width = this.PUZZLE_SIZE/2;
        height=width = this.PUZZLE_SIZE/1.9;
        x=x+this.PUZZLE_SIZE/2;
        y=y+this.PUZZLE_SIZE/4;
        context =this.context;
       context.beginPath();
        context.moveTo(x, y);
        context.shadowColor='white';
        context.shadowBlur = 10;    
        context.fillStyle = "LightSkyBlue";   
        context.lineTo(x - width / 2, y + height / 2);
        context.lineTo(x, y + height);
        context.lineTo(x + width / 2, y + height / 2);
        context.closePath();
        context.fill();
        context.shadowColor=0;
        context.shadowBlur = 0;
    }

    Draw.box = function (x,y) {
        this.context.fillStyle = 'gray';
        this.context.fillRect(x,y,this.PUZZLE_SIZE,this.PUZZLE_SIZE);
        this.context.fillStyle = 'black';
        this.context.fillRect(x+this.PUZZLE_SIZE/10,y+this.PUZZLE_SIZE/10,this.PUZZLE_SIZE-this.PUZZLE_SIZE/10,this.PUZZLE_SIZE-this.PUZZLE_SIZE/10);
    }

    Draw.cell = function (i,j) {
        x = i* this.PUZZLE_SIZE;
        y = j* this.PUZZLE_SIZE;
        switch (Board.MAP[j][i]) {
            case '#':
                this.cellEnviroment(x,y,"gray");
                break;
            case '*':
                this.cellCoin(x,y);
                break;
            case '+':
                this.pill(x,y);
            break;
            case 'P':
                this.prison(x,y);
            break;
            case '-':
                this.door(x,y,'horizontal');
            break;
            case '|':
                this.door(x,y,'vertical');
            break;
            case 'K':
                this.key(x,y);
            break;
            case 'D':
                this.diamond(x,y);
            break;
            case 'B':
                this.box(x,y);
            break;
        
            default:
                this.cellEnviroment(x,y,"black");
                break;
        }
    }

    Draw.door = function (x,y,type) {
        this.context.fillStyle = 'brown';
        if(type=='horizontal'){
        this.context.fillRect(x,y+this.PUZZLE_SIZE/3,this.PUZZLE_SIZE,this.PUZZLE_SIZE/3);
        }
        else{
            this.context.fillRect(x+this.PUZZLE_SIZE/3,y,this.PUZZLE_SIZE/3,this.PUZZLE_SIZE);
        }
    }

    Draw.cellEnviroment = function (x,y,color) {
        this.context.fillStyle = color;
        this.context.fillRect(x,y,this.PUZZLE_SIZE,this.PUZZLE_SIZE);
    }

    Draw.prison = function(x,y){
        width = (this.PUZZLE_SIZE-this.PUZZLE_SIZE/4)/6;
        width2 =(this.PUZZLE_SIZE/4)/1.5;
        this.context.fillStyle = 'white';
        this.context.fillRect(x+width2*0.95,y,width,this.PUZZLE_SIZE);
        this.context.fillRect(x+2*width2*0.95+width,y,width,this.PUZZLE_SIZE);
        this.context.fillRect(x+3*width2*0.95+2*width,y,width,this.PUZZLE_SIZE); 
    }

    Draw.cellCoin = function (x,y) {       
        this.context.beginPath();
        this.context.shadowColor='white';
        this.context.shadowBlur = 5;
        this.context.fillStyle = 'white';
        this.context.arc(x + this.PUZZLE_SIZE/2, y+4 + this.PUZZLE_SIZE/2, this.PUZZLE_SIZE/15, 0, 2 * Math.PI);
        this.context.closePath();
        this.context.stroke();
        this.context.fill();
        
        this.context.shadowColor=0;
        this.context.shadowBlur = 0;
        
        this.context.beginPath();
        this.context.fillStyle = 'yellow';
        this.context.arc(x + this.PUZZLE_SIZE/2, y + this.PUZZLE_SIZE/2, this.PUZZLE_SIZE/6, 0, 2 * Math.PI);
        this.context.closePath();
        this.context.stroke();
        this.context.fill();  
    }

    Draw.pill = function (x,y) {       
        this.context.beginPath();
        this.context.shadowColor='white';
        this.context.shadowBlur = 8;
        this.context.fillStyle = 'white';
        this.context.arc(x + this.PUZZLE_SIZE/2, y + this.PUZZLE_SIZE/2, this.PUZZLE_SIZE/4, 0, 2 * Math.PI);
        this.context.closePath();
        this.context.stroke();
        this.context.fill();  
        this.context.beginPath();
        this.context.shadowColor=0;
        this.context.shadowBlur = 0;
        this.context.strokeStyle = '#444488';
        this.context.fillStyle = '#444488';
        this.context.arc(x + this.PUZZLE_SIZE/2, y + this.PUZZLE_SIZE/2, this.PUZZLE_SIZE/5, 0, 2 * Math.PI);
        this.context.closePath();
        this.context.stroke();
        this.context.fill();
    }
    Draw.circle = function(x,y,radius,angle1,angle2,c,clockwise=false,lineWidth=false){
        this.context.beginPath();
        this.context.strokeStyle = c;
        this.context.fillStyle=c;
        if(lineWidth){
            this.context.lineWidth=lineWidth;
        }
        this.context.arc(x,y,radius,angle1,angle2,clockwise);
        this.context.closePath();
        this.context.stroke();
        this.context.fill();
    }

    Draw.ghost = function (x,y,color,direction=null) {
        var radius = this.PUZZLE_SIZE/2.5;
        if(Game.IMMORTALITY){
            color='rgba(200, 200, 200, 1)';
        }
        const angle = Math.PI/180;

        this.circle(x,y,radius,angle*0,angle*360,color,true,0);
        this.circle(x+radius/1.6,y+radius/1.5,this.PUZZLE_SIZE/6,0,2 * Math.PI,color);
        this.circle(x,y+radius/1.5,this.PUZZLE_SIZE/6,0,2 * Math.PI,color);
        this.circle(x-radius/1.6,y+radius/1.5,this.PUZZLE_SIZE/6,0,2 * Math.PI,color);
        this.circle(x+radius/3,y-radius/2.5,this.PUZZLE_SIZE/9,0,2 * Math.PI,"black");
        this.circle(x+radius/3,y-radius/2.5,this.PUZZLE_SIZE/30,0,2 * Math.PI,color);
        this.circle(x-radius/3,y-radius/2,this.PUZZLE_SIZE/9,0,2 * Math.PI,'black');
        this.circle(x-radius/3,y-radius/2,this.PUZZLE_SIZE/30,0,2 * Math.PI,color);
        this.circle(x,y+radius/3,radius/3,angle*0,angle*360,'black',true);

        if(Game.IMMORTALITY){
            this.circle(x,y+radius/2,radius/3,angle*0,angle*360,color,true);
        }  
    }

    Draw.pacman = function (x,y,direction) {
        Player.LAST_DIRECTION=direction;
        var radius = this.PUZZLE_SIZE/2.5;
        const angle = Math.PI/180;
        this.context.beginPath();
        this.context.strokeStyle = 'yellow';
        this.context.fillStyle='yellow';

        if(direction=='left'){
            this.context.arc(x,y,radius,angle*140,angle*220,true);
        }
        else if(direction=='down'|| direction=='up'){
            this.context.arc(x,y,radius,angle*0,angle*360,true);
        }
        else{
            this.context.arc(x,y,radius,angle*30,angle*330,false);
        }

        this.context.lineTo(x,y);       
        this.context.closePath();    
        this.context.stroke();
        this.context.fill();

        if(direction!='up'){
            this.circle(x+radius/3,y-radius/2,this.PUZZLE_SIZE/9,0,2 * Math.PI,'white');
            this.circle(x+radius/3,y-radius/2,this.PUZZLE_SIZE/30,0,2 * Math.PI,'black');
        }

        if(direction=='down'){
            this.circle(x-radius/3,y-radius/2,this.PUZZLE_SIZE/9,0,2 * Math.PI,'white');
            this.circle(x-radius/3,y-radius/2,this.PUZZLE_SIZE/30,0,2 * Math.PI,'black');
            this.circle(x,y,radius/1.4,angle*160,angle*380,'black',true); //angle*190,angle*350 smile
            this.circle(x,y+radius/1.8,radius/1.4,angle*200,angle*340,'black'); //angle*190,angle*350 smile
        }
    }

    Player.searchInventory = function(item){
        var result = false;
        for (let i = 0; i < this.INVENTORY.length; i++) {
            if(item == this.INVENTORY[i]){
                result = true;
            }  
        }
        return result;
    }

    Player.move = function(diffX,diffY,direction) {
        let x = this.START_POS_X+diffX;
        let y = this.START_POS_Y+diffY;
        switch (Board.MAP[y][x]) {
            case '#':
                Sounds.playSound(Sounds.STEP_WRONG,1);
                return;
                break;
            case '*':
                Game.SCORE+=10;
                Draw.scoreText();
                Board.clearField(x,y);
                Sounds.playSound(Sounds.POLK,1);
                break;
            case 'D':
                Game.SCORE+=500;
                Draw.scoreText();
                Board.clearField(x,y);;
                Sounds.playSound(Sounds.DIAMOND,1);
                break;
            case '+':
                Game.SCORE+=50;
                Draw.scoreText();
                Board.clearField(x,y);;
                Sounds.playSound(Sounds.PILL,1);
                Sounds.playSound(Sounds.PILL10,0.3);
                if(Game.IMMORTALITY==true){
                    clearTimeout(this.IMMORTALITY_TIMER);
                }
                this.IMMORTALITY_TIMER = setTimeout(function(){Game.IMMORTALITY=false;},10000);

                Game.IMMORTALITY=true;
                break;
            case 'K':
                Game.SCORE+=200;
                Draw.scoreText();
                Player.INVENTORY.push('K');
                Draw.updateInventory();
                Board.clearField(x,y);;
                Sounds.playSound(Sounds.PILL,1);
                Ghosts.GHOSTS.forEach(ghost => {
                    ghost.findWay(x,y);
                });
                break;
            case '-':
                if(Player.searchInventory('K')){
                    Board.clearField(x,y);;
                    var index = Player.INVENTORY.indexOf('K');
                    if (index !== -1) {
                        Player.INVENTORY.splice(index, 1);
                    }
                    Sounds.playSound(Sounds.LOCK,1);
                    Draw.updateInventory();
                }
                else{
                    Sounds.playSound(Sounds.STEP_WRONG,1);
                    return;
                }
                break;
            case '|':
                if(Player.searchInventory('K')){
                    Board.clearField(x,y);
                    var index = Player.INVENTORY.indexOf('K');
                    if (index !== -1) {
                        Player.INVENTORY.splice(index, 1);
                    }
                    Sounds.playSound(Sounds.LOCK,1);
                    Draw.updateInventory();
                }
                else{
                    Sounds.playSound(Sounds.STEP_WRONG,1);
                    return;
                }
                break;

        
            default:
                break;
        }

        x = this.START_POS_X* Draw.PUZZLE_SIZE;
        y = this.START_POS_Y* Draw.PUZZLE_SIZE;
        Draw.cellEnviroment(x,y,'black');
        this.START_POS_X+=diffX;
        this.START_POS_Y+=diffY;
        x= (this.START_POS_X*Draw.PUZZLE_SIZE)+Draw.PUZZLE_SIZE/2;
        y= (this.START_POS_Y*Draw.PUZZLE_SIZE)+Draw.PUZZLE_SIZE/2;
        
        Draw.pacman(x,y,direction);
    }

    Player.control = function (e){
        if(!Player.CONTINUOUS_MOVE){
            Player.stopListening();
        }
        if(!Game.OVER){
            setTimeout(function(){Player.startListening();},Player.SPEED);
        }
        switch (e.key) {
            case 'ArrowLeft':
                if(Game.STATE){
                    Player.DIRECTION='left';
                }
                if(!Player.CONTINUOUS_MOVE){
                    Player.moveDirection('left');
                }
                break;
            case 'ArrowRight':
                if(Game.STATE){
                    Player.DIRECTION='right';
                }
                if(!Player.CONTINUOUS_MOVE){
                    Player.moveDirection('right');
                }
                break;
            case 'ArrowUp':
                if(Game.STATE){
                    Player.DIRECTION='up';
                }
                if(!Player.CONTINUOUS_MOVE){
                    Player.moveDirection('up');
                }
                break;
            case 'ArrowDown':
                if(Game.STATE){
                    Player.DIRECTION='down';
                }
                if(!Player.CONTINUOUS_MOVE){
                    Player.moveDirection('down');
                }
                break;  
            case 's':
                Game.run();
                break;
               
            default:
                break;
                
        }
        
    }

    Player.moveDirection =function (direction) {
        switch (direction) {
            case 'left':
                Player.move(-1,0,'left');
                
                break;
            case 'right':
                Player.move(+1,0,'right');
                
                break;
            case 'up':
                Player.move(0,-1,'up');
                
                break;
            case 'down':
                Player.move(0,+1,'down');     
            default:
                break;
        }

    }
    
    Player.startListening = function () {
        document.addEventListener('keydown',this.control);
    }

    Player.stopListening = function () {
        document.removeEventListener('keydown',this.control);
    }

    Player.setInterval = function() {
        Player.INTERVAL=setInterval(function(){Player.moveDirection(Player.DIRECTION);},Player.SPEED);
    }

    

    Ghosts.setIntervals = function(){   
        for (let i = 0; i < Ghosts.GHOSTS.length; i++) {
            if(this.INTERVALS[i]){clearInterval(this.INTERVALS[i]);}
            this.INTERVALS[i]= setInterval(function(){Ghosts.GHOSTS[i].move();},Ghosts.GHOSTS[i].SPEED);       
        }
    }

    Sounds.playSound= function (sound, volume,loop=false) {
        sound.volume = volume;
        sound.currentTime = 0;
        sound.loop = loop;
        sound.play();  
    }

    Game.check = function (){      
        // for (let i = 0; i < Ghosts.GHOSTS.length; i++) {
        //     Ghosts.GHOSTS[i].checkSeePlayer();    
        // }
        var stars=0;
        for (let g = 0; g < Game.SIZE_W; g++) {
            for (let h = 0; h < Game.SIZE_H; h++) {
                if(Board.MAP[g][h]=='*'||Board.MAP[g][h]=='+'||Board.MAP[g][h]=='D')
                stars++;
            }
        }
        if(stars==0){
            
            Sounds.playSound(Sounds.WIN,1);
            if(Game.LEVEL+1<Board.MAPS.length){
                Game.nextLevel();
            }
            else{
                Game.LEVEL=0;
                setTimeout(function(){Draw.gameWin();},1000);
                Game.stop();
            }
        } 
        for (let i = 0; i < Ghosts.GHOSTS.length; i++) {
            if(Ghosts.GHOSTS[i].START_POS_X==Player.START_POS_X && Ghosts.GHOSTS[i].START_POS_Y==Player.START_POS_Y){
                if(Game.IMMORTALITY==false){
                    
                Sounds.playSound(Sounds.DIES,1);
                
                setTimeout(function(){Draw.gameOver();Sounds.playSound(Sounds.OVER,1);},1000);
                Game.stop();
                }
                else{
                    Sounds.playSound(Sounds.DIE_MONSTER,1);
                    Game.SCORE+=100;
                    Draw.scoreText();
                    Ghosts.GHOSTS[i].START_POS_X=Game.PRISON_POSITION_X; 
                    Ghosts.GHOSTS[i].START_POS_Y=Game.PRISON_POSITION_Y; 
                    //Ghosts.GHOSTS[i].move(); 
                    Ghosts.GHOSTS[i].IN_PRISON = true;
                    Ghosts.GHOSTS[i].draw();
                    Draw.prison(Game.PRISON_POSITION_X*Draw.PUZZLE_SIZE,Game.PRISON_POSITION_Y*Draw.PUZZLE_SIZE);
                    Sounds.playSound(Sounds.SHUT_DOOR,1);
                    setTimeout(function(){Ghosts.GHOSTS[i].IN_PRISON = false;Sounds.playSound(Sounds.OPEN_DOOR,0.8);},5000);
                    setTimeout(function(){Draw.prison(Game.PRISON_POSITION_X*Draw.PUZZLE_SIZE,Game.PRISON_POSITION_Y*Draw.PUZZLE_SIZE);Sounds.playSound(Sounds.SHUT_DOOR,1);},6000);
                    var x= (Player.START_POS_X*Draw.PUZZLE_SIZE)+Draw.PUZZLE_SIZE/2;
                    var y= (Player.START_POS_Y*Draw.PUZZLE_SIZE)+Draw.PUZZLE_SIZE/2;
                    Draw.pacman(x,y,Player.LAST_DIRECTION); 
                }
            }
            
        }
    }

    Game.getPrisonPosXY = function(){
        for (let g = 0; g < Game.SIZE_W; g++) {
            for (let h = 0; h < Game.SIZE_H; h++) {
                if(Board.MAP[g][h]=='P'){
                this.PRISON_POSITION_X = h;
                this.PRISON_POSITION_Y = g;
                }
            }
         
        }

    }

    Game.start = function () {
        
        Draw.init();
        Draw.firstPage();
        Player.startListening();
        Board.MAP = Board.MAPS[0];
        Sounds.playSound(Sounds.BG_SOUND,0.3,true);
    }
    Game.run = function () {
        Game.STATE = true;
        Draw.all();
        this.getPrisonPosXY();
        Ghosts.init();
        if(Player.CONTINUOUS_MOVE){
            Player.setInterval();
        }
        
    }
    Game.nextLevel = function () {
        for (let i = 0; i < Ghosts.GHOSTS.length; i++) {
            
            clearInterval(Ghosts.INTERVALS[i]);
            
        }
        if(Player.CONTINUOUS_MOVE){
            clearInterval(Player.INTERVAL);
        }
        clearInterval(Ghosts.CHECK_INTERVAL);
        Board.MAP=Board.MAPS[Game.LEVEL+1];
        Game.LEVEL++;
        Player.START_POS_X = 10;
        Player.START_POS_Y = 4;
        Game.run();
    }

    Game.stop = function () { 
        Game.STATE = false;
        Player.DIRECTION = null;
        Game.OVER=true;
        for (let i = 0; i < Ghosts.GHOSTS.length; i++) {
            
                clearInterval(Ghosts.INTERVALS[i]);
                
        }
        clearInterval(Ghosts.CHECK_INTERVAL);
        Player.stopListening();
    }

    Game.start();  
});