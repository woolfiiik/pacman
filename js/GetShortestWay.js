let GetShortestWay = function (startPosition, finishPosition, MAP, impossibleWays){
    this.memory = [];
    this.resultWays = [startPosition];
    this.aim = false;
    this.used = [];
    this.stepNr=0;
    this.MAP = MAP;
    this.finish = finishPosition;
    this.impossibleWays = impossibleWays;
    this.finalPath=[];
    this.ingeritance;
    
    freeWays = function (xy){  
        let possibleWays = [];
            if(!this.impossibleWays.includes(this.MAP[xy.y][xy.x-1])){   
                let coo = new Coordinates(xy.x-1,xy.y,xy.id);
                possibleWays.push(coo);
            }
            if(!this.impossibleWays.includes(this.MAP[xy.y][xy.x+1])){   
                let coo = new Coordinates(xy.x+1,xy.y,xy.id);
                possibleWays.push(coo);
            } 
            if(!this.impossibleWays.includes(this.MAP[xy.y-1][xy.x])){   
                let coo = new Coordinates(xy.x,xy.y-1,xy.id);
                possibleWays.push(coo);
            }     
            if(!this.impossibleWays.includes(this.MAP[xy.y+1][xy.x])){   
                let coo = new Coordinates(xy.x,xy.y+1,xy.id);
                possibleWays.push(coo);
            }                
        return possibleWays;
        console.log(possibleWays);
    };
    search = function(){   
        while(aim==false) {
            this.stepNr++;
            let result= [];
        
            //get possible ways for all got areas
            for (let i = 0; i < this.resultWays.length; i++) {
                if(result.length==0){
                    result=this.freeWays(this.resultWays[i]);
                }
                else{
                    result=[...result,...this.freeWays(this.resultWays[i])];
                }  
            }
            //expant used areas
            this.used = [...this.used,...this.resultWays];
        
            
            //remove used areas
            for( var i = 0; i < this.used.length; i++){ 
                for (let j = 0; j < result.length; j++) {
                    if ( result[j].x == this.used[i].x && result[j].y == this.used[i].y) { 
                        result.splice(j, 1); 
                        j--; 
                    }  
                }                            
            }
            //remove duplicities
            for( var i = 0; i < result.length; i++){ 
                for (let j = 0; j < result.length; j++) {   
                    if ( result[j].x == result[i].x && result[j].y == result[i].y && i!=j) { 
                        result.splice(j, 1); 
                        j--; 
                    }  
                }                            
            }
            //check is aim ...finish
            result.forEach(way => {
                if(way.x == finish.x && way.y == finish.y){
                    this.aim=true;
                    console.log('cil nalezen:' +stepNr+' kroků');
                }
            });
        
            this.resultWays = result;
            this.memory.push(this.resultWays);
        
        }
        
        for (let j = 0; j < this.memory[this.memory.length-1].length; j++) {
            if(this.memory[this.memory.length-1][j].x == finish.x && this.memory[this.memory.length-1][j].y == finish.y){
            this.finalPath.unshift(this.memory[this.memory.length-1][j]);
            this.inheritance = this.memory[this.memory.length-1][j].parent;
            }
        }

        for (let i = this.memory.length-2; i >= 0; i--) {
            for (let j = 0; j < this.memory[i].length; j++) {
                if(this.memory[i][j].id==this.inheritance){
                    this.finalPath.unshift(memory[i][j]);
                    this.inheritance = this.memory[i][j].parent;
                }
            }       
        }
        return this.finalPath;
    }
    return this.search();
}