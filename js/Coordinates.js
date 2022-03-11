let Coordinates=(function(){
    let ai=0;
    function Coordinates(x,y,parent=false){
        this.x=x;
        this.y=y;
        this.id;
        this.parent=parent;
        if(!this.id){
            this.id=ai+1;
            ai++;
        }

        this.getValue= function(){
            return mapa[this.y][this.x];
        };
    }
    return Coordinates;
}());