// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
        targetNode:cc.Node,
        knifeNode:cc.Node,
        knifesomuch:cc.Prefab,

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.canThrow = true;
        this.targetNode.zIndex=1;
        this.targetRotation = 3;
        this.knifeNodeArr = [];

        this.node.on('touchstart',this.throwknife,this);
    },

    onDestroy(){
        this.node.off('touchstart',this.throwknife,this);
    },

    throwknife(){
        if(this.canThrow){
            this.canThrow = false;
            this.knifeNode.runAction(cc.sequence(
                cc.moveTo(0.15,cc.v2(this.knifeNode.x, this.targetNode.y-this.targetNode.width/2)),
                
                // 完成投擲後的動作
                cc.callFunc(()=>{
                    let ishit = false;//ishit=打中插在目標的飛刀(預設沒打到)
                    let get = 15;//碰撞判定範圍

                    for(let knifeNode of this.knifeNodeArr){ 
                        //判斷射出後的小刀是否撞擊到目標物上的小刀判定範圍內
                        if(knifeNode.angle<get || (360-knifeNode.angle)<get){
                            ishit=true;
                            break;
                        }
                    }


                    if(ishit){//處理如果打中的小刀效果
                        this.knifeNode.runAction(cc.sequence(
                            cc.spawn( //小刀彈開飛到畫面外
                                cc.moveTo(0.25,cc.v2(this.knifeNode.x,-cc.winSize.height)),
                                //改變角度
                                cc.rotateTo(0.25,30)
                            ),
                            cc.callFunc(()=>{
                                cc.director.loadScene('game'); //結束重來
                            })
                        ))
                    }else{
                        // 丟出小刀讓小刀停留在畫面上
                        let knifeNode = cc.instantiate(this.knifesomuch);
                        knifeNode.setPosition(this.knifeNode.position);
                        // 生成新的小刀，重新開始可以丟小刀
                        this.node.addChild(knifeNode);
                        this.knifeNode.setPosition(cc.v2(0,-300))

                        // 將射出的飛刀製作陣列
                        this.knifeNodeArr.push(knifeNode);

                        this.canThrow = true;
                    }


                    
                })    
            ));
        }},

    // start () {

    // },

    update (dt) {
        // 目標物旋轉
        this.targetNode.angle = (this.targetNode.angle+this.targetRotation) % 360;

        for(let knifeNode of this.knifeNodeArr){ //處理插入的飛刀
            // 角度
            knifeNode.angle = (knifeNode.angle+this.targetRotation)%360;

            let rud = Math.PI*(knifeNode.angle-90)/180;
            let r = this.targetNode.width/2; //r=目標物半徑
            knifeNode.x=this.targetNode.x + r * Math.cos(rud);
            knifeNode.y=this.targetNode.y + r * Math.sin(rud);
        }
    },
});
