declare var aud:any;
declare var audio_context:any;

export class UIScene extends Phaser.Scene {

    leader: Object[] = [];

    constructor ()
    {
        super({ key: 'UIScene', active: true });
    }

    create()
    {
        for (var i = 0; i < 11; i++)
        {
            this.leader.push({
                "place": this.add.text(this.sys.canvas.width - 400, (i + 1) * 12, '', { font: '12px Arial', fill: '#FFFFFF', background: '#000000' }),
                "name": this.add.text(this.sys.canvas.width - 200, (i + 1) * 12, '', { font: '12px Arial', fill: '#FFFFFF', background: '#000000' }),
                "score": this.add.text(this.sys.canvas.width - 20, (i + 1) * 12, '', { font: '12px Arial', fill: '#FFFFFF', background: '#000000' })
            });
        }
        
        let finalGame = this.scene.get('GameScene');

        let self = this;

        finalGame.events.on('update_leaderboard', function (data) {
            for (var x = 0; x<self.leader.length; x++)
            {
                self.leader[x]["place"].setText('');
                self.leader[x]["name"].setText('');
                self.leader[x]["score"].setText('');
            }

            for (var i = 0; i < data.length; i++)
            {
                self.leader[i]["place"].setText(data[i]["place"]);
                self.leader[i]["name"].setText(data[i]["name"]);
                self.leader[i]["score"].setText(data[i]["score"]);
            }

            if (data.length > 10)
            {
                self.leader[10]["place"].setText(data[10]["place"]);
                self.leader[10]["name"].setText(data[10]["name"]);
                self.leader[10]["score"].setText(data[10]["score"]);
            }
         }, self);
    }
}