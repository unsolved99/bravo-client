/*
     Bravo client v1.0
     Created by Unsolved99
*/
const player = {
     mouseX: NaN,
     mouseY: NaN,
};

function Cell(id, x, y, s, name, color, skin, flags) {
     this.id = id;
     this.x = this.nx = this.ox = x;
     this.y = this.ny = this.oy = y;
     this.s = this.ns = this.os = s;
     this.setColor(color);
     this.setName(name);
     this.setSkin(skin);
     this.jagged = flags & 0x01 || flags & 0x10;
     this.uuid = flags & 0x06;
     this.ejected = !!(flags & 0x20);
     this.born = syncUpdStamp;
     this.points = [];
     this.pointsVel = [];
 }
 
 Cell.prototype = {
     destroyed: false,
     id: 0,
     diedBy: 0,
     ox: 0,
     x: 0,
     nx: 0,
     oy: 0,
     y: 0,
     ny: 0,
     os: 0,
     oos: 0,
     s: 0,
     ns: 0,
     viewRange: 0,
     nameSize: 0,
     drawNameSize: 0,
     color: "#FFF",
     sColor: "#E5E5E5",
     skin: null,
     uuid: null,
     jagged: false,
     born: null,
     updated: null,
     dead: null, // timestamps
     destroy: function (killerId) {
         delete cells.byId[this.id];
         if (cells.mine.remove(this.id) && cells.mine.length === 0)
             showESCOverlay();
         this.destroyed = true;
         this.dead = syncUpdStamp;
         if (killerId && !this.diedBy) {
             this.diedBy = killerId;
             this.updated = syncUpdStamp;
         }
     },
     update: function (relativeTime) {
         var dt = (relativeTime - this.updated) / settings.animationDelay;
         dt = Math.max(Math.min(dt, 1), 0);
         if (this.destroyed && Date.now() > this.dead + 200)
             cells.list.remove(this);
         else if (this.diedBy && cells.byId.hasOwnProperty(this.diedBy)) {
             this.nx = cells.byId[this.diedBy].x;
             this.ny = cells.byId[this.diedBy].y;
         }
         this.x = this.ox + (this.nx - this.ox) * dt;
         this.y = this.oy + (this.ny - this.oy) * dt;
         this.s = this.os + (this.ns - this.os) * dt;
         this.nameSize = ~~(~~Math.max(~~(0.3 * this.ns), 24) / 3) * 5;
         this.drawNameSize = ~~(~~Math.max(~~(0.3 * this.s), 24) / 3) * 5;
     },
     updateNumPoints: function () {
         var numPoints = camera.scale >= 0.19 ? (this.s * camera.scale) | 0 : 1;
         numPoints = Math.max(numPoints, CELL_POINTS_MIN);
         numPoints = Math.min(numPoints, CELL_POINTS_MAX);
         if (this.jagged) numPoints = VIRUS_POINTS;
         while (this.points.length > numPoints) {
             var i = (Math.random() * this.points.length) | 0;
             this.points.splice(i, 1);
             this.pointsVel.splice(i, 1);
         }
         if (this.points.length == 0 && numPoints != 0) {
             this.points.push({
                 x: this.x,
                 y: this.y,
                 rl: this.s,
                 parent: this,
             });
             this.pointsVel.push(Math.random() - 0.5);
         }
         while (this.points.length < numPoints) {
             var i = (Math.random() * this.points.length) | 0;
             var point = this.points[i];
             var vel = this.pointsVel[i];
             this.points.splice(i, 0, {
                 x: point.x,
                 y: point.y,
                 rl: point.rl,
                 parent: this,
             });
             this.pointsVel.splice(i, 0, vel);
         }
     },
     movePoints: function () {
         var pointsVel = this.pointsVel.slice();
         var len = this.points.length;
         for (var i = 0; i < len; ++i) {
             var prevVel = pointsVel[(i - 1 + len) % len];
             var nextVel = pointsVel[(i + 1) % len];
             var newVel = (this.pointsVel[i] + Math.random() - 0.5) * 0.7;
             newVel = Math.max(Math.min(newVel, 10), -10);
             this.pointsVel[i] = (prevVel + nextVel + 8 * newVel) / 10;
         }
         for (var i = 0; i < len; ++i) {
             var curP = this.points[i];
             var curRl = curP.rl;
             var prevRl = this.points[(i - 1 + len) % len].rl;
             var nextRl = this.points[(i + 1) % len].rl;
             var self = this;
             var affected = quadtree.some({
                 x: curP.x - 5,
                 y: curP.y - 5,
                 w: 10,
                 h: 10,
             },
                 function (item) {
                     return item.parent != self && sqDist(item, curP) <= 25;
                 }
             );
             if (
                 !affected &&
                 (curP.x < border.left ||
                     curP.y < border.top ||
                     curP.x > border.right ||
                     curP.y > border.bottom)
             ) {
                 affected = true;
             }
             if (affected) {
                 this.pointsVel[i] = Math.min(this.pointsVel[i], 0);
                 this.pointsVel[i] -= 1;
             }
             curRl += this.pointsVel[i] * 2;
             curRl = Math.max(curRl, 0);
             curRl = (9 * curRl + this.s) / 10;
             curP.rl = (prevRl + nextRl + 8 * curRl) / 10;

             var angle = (2 * Math.PI * i) / len;
             var rl = curP.rl;
             if (this.jagged && i % 2 == 0) {
                 rl += 5;
             }
             curP.x = this.x + Math.cos(angle) * rl;
             curP.y = this.y + Math.sin(angle) * rl;
         }
     },
     setName: function (name) {
         this.name = name;
     },
     setSkin: function (value) {
         this.skin =
             (value && value[0] === "%" ? value.slice(1) : value) || this.skin;
         if (
             this.skin === null ||
             !knownSkins.hasOwnProperty(this.skin) ||
             loadedSkins[this.skin]
         )
             return;
         loadedSkins[this.skin] = new Image();
         loadedSkins[this.skin].src = SKIN_URL + this.skin + ".png";
     },
     setytSkin: function (value) {
         this.skin =
             (value && value[0] === "%" ? value.slice(1) : value) || this.skin;
         if (
             this.skin === null ||
             !ytknownSkins.hasOwnProperty(this.skin) ||
             loadedytSkins[this.skin]
         )
             return;
         loadedytSkins[this.skin] = new Image();
         loadedytSkins[this.skin].src = YTSKIN_URL + this.skin + ".png";
     },
     setColor: function (value) {
         if (!value) {
             log.warn("got no color");
             return;
         }
         this.color = value;
         this.sColor = darkenColor(value);
     },
     draw: function (ctx) {
         ctx.save();
         this.drawShape(ctx);
         this.drawText(ctx);
         ctx.restore();
     },

     /*          if(window.location.hash) {
                                         let partyCode = window.location.hash.substring(1);
                                         let isParty = true;
                                         let ringColor = "#ffae00";
                                         // console.log(`Party Code: ${partyCode}`)

                                         window.location.hash ? "#ffae00" : 

                                     } */

     drawShape: function (ctx) {
         // if ((this.viewRange < settings.drawNamesDistance) && cells.mine.indexOf(this.id) === -1) return;
         ctx.fillStyle = settings.showColor ? this.color : Cell.prototype.color;
         ctx.strokeStyle = settings.showColor ?
             settings.showSkins && this.skin && this.skin != null ?
                 skincolor[this.skin] :
                 this.sColor :
             Cell.prototype.sColor;

         ctx.lineWidth = Math.max(~~(this.s / 0), 0);
         if (this.s > 20) this.s -= ctx.lineWidth / 2;

         /* if (settings.showRings && cells.mine.indexOf(this.id) !== -1 || settings.showRings && LB_Friends.includes(this.name))
             ctx.strokeStyle = "#ffae00", ctx.lineWidth = Math.max(~~(this.s / 0), 20); */
         if (settings.showRings && cells.mine.indexOf(this.id) !== -1 || settings.showRings && LB_Friends.includes(this.name))
             ctx.strokeStyle = "#f0ec00", this.s > 600 && settings.showPartyAutoResizeRings ? ctx.lineWidth = Math.max(~~(this.s / 0), 20) : ctx.lineWidth = Math.max(~~(this.s / 0), 10);
         if (ctx.strokeStyle == "#000000") ctx.strokeStyle = this.sColor;

         /* // halloween only
             if (this.sColor == '#2de52d') {
             this.setSkin("ThanksgivingPumpkin");
         } */

         /* // Winter Christmas only
             if (this.sColor == '#2de52d') {
             this.setSkin("SnowFlake");
         } */

         // St Patrick's Day Event
         /*     if (this.sColor == '#5c4696') {
                 ctx.lineWidth = 0;
                 this.setSkin("stPatrickEvent");
                 this.sColor == '#BF60DF40';
                 ctx.strokeStyle = "transparent";
                 ctx.fillStyle = "rgba(103, 78, 166, 0.00)"
         } */

         // Easter Event
         if (this.sColor == '#5c4696') {
             ctx.lineWidth = 0;
             this.setSkin("easterEvent");
             this.sColor == '#BF60DF40';
             ctx.strokeStyle = "transparent";
             ctx.fillStyle = "rgba(103, 78, 166, 0.00)"
         }
         
         // virus color: this.sColor == '#33ff33'

         let biggestPointValue = 0;

         ctx.beginPath();
         if (this.jagged) ctx.lineJoin = "miter";
         if (settings.jellyPhysics && this.points.length) {
             var point = this.points[0];

             if (camera.scale >= 0.2) {
                 ctx.moveTo(point.x, point.y);
                 for (var i = 0; i < this.points.length; ++i) {
                     var point = this.points[i];
                     ctx.lineTo(point.x, point.y);
                     if (this.points[i].rl > biggestPointValue)
                         biggestPointValue = this.points[i].rl;
                 }
             } else {
                 ctx.arc(this.x, this.y, point.rl, 0, PI_2, false);
                 biggestPointValue = this.points[0].rl;
             }
             // ctx.arc(this.x, this.y, point.rl, 0, PI_2, false);
         } else if (this.jagged) {
             var pointCount = 120;
             var incremental = PI_2 / pointCount;
             ctx.moveTo(this.x, this.y + this.s + 3);
             for (var i = 1; i < pointCount; i++) {
                 var angle = i * incremental;
                 var dist = this.s - 3 + (i % 2 === 0) * 6;
                 ctx.lineTo(
                     this.x + dist * Math.sin(angle),
                     this.y + dist * Math.cos(angle)
                 );
             }
             ctx.lineTo(this.x, this.y + this.s + 3);
         } else ctx.arc(this.x, this.y, this.s, 0, PI_2, false);
         ctx.closePath();

         if (this.destroyed)
             ctx.globalAlpha = Math.max(120 - Date.now() + this.dead, 0) / 120;
         else ctx.globalAlpha = Math.min(Date.now() - this.born, 120) / 120;

         if (settings.fillSkin) ctx.fill();
         if (settings.showSkins && this.skin) {
             var skin = loadedSkins[this.skin] || loadedytSkins[this.skin];
             if (skin && skin.complete && skin.width && skin.height) {
                 ctx.save();
                 ctx.clip();
                 scaleBack(ctx);
                 var sScaled =
                     (settings.jellyPhysics ? biggestPointValue : this.s) * camera.scale;
                 ctx.drawImage(
                     skin,
                     this.x * camera.scale - sScaled,
                     this.y * camera.scale - sScaled,
                     (sScaled *= 2),
                     sScaled
                 );
                 scaleForth(ctx);
                 ctx.restore();
             }
         } else if (!settings.fillSkin) ctx.fill();
         if (this.s > 20) {
             ctx.stroke();
             this.s += ctx.lineWidth / 2;

             if (settings.showRings && cells.mine.indexOf(this.id) !== -1 || settings.showRings && LB_Friends.includes(this.name)) {
                 ctx.strokeStyle = '#ffae00';
                 this.s > 600 && settings.showPartyAutoResizeRings ? ctx.lineWidth = Math.max(~~(this.s / 0), 15) : ctx.lineWidth = Math.max(~~(this.s / 0), 5);
                 ctx.stroke();
                 this.s += ctx.lineWidth / 2;
             }
         }
     },
     drawText: function (ctx) {
         if (this.s < 20 || this.jagged) return;
         var y = this.y;
         var uwu = this.y;
         var owo = this.x;
         // let range = document.getElementById('drawNamesDistance').value || 1;
         let range = settings.drawNamesDistance || 1;
         if (this.name && settings.showNames && this.viewRange > range) {
             let next;
             let name = '';
             name = this.name;
             let maxNickSize = 16;
             let bannedNick = /[௵﷽]/g;
             const checkNick = name.match(bannedNick);
             this.name.length > maxNickSize ? name = truncateText(this.name, maxNickSize) : name;
             checkNick ? name = 'WWW-IMSOLO-PRO' : name;
             // console.log(drawNamesDistance);

             // drawText(ctx, false, this.x, this.y, this.nameSize, this.drawNameSize, this.name) : 
             //dont cry TheFrog ...
             // drawText(ctx, false, this.x, this.y, this.nameSize * (2 - 0.1 * this.name.length), this.drawNameSize * (2 - 0.1 * this.name.length), this.name);
             if (settings.betaPartyStuff && LB_Friends.includes(this.name)) {

                 uwu += Math.max(this.s / 3, 10 * 1.5);
                 owo -= Math.max(this.s / 10, 0);

                 var image = new Image();
                 image.src = "assets/img/game/friend_fix.png";
                 // ctx.drawImage(image, this.x - (this.drawNameSize / 2), this.y - (this.drawNameSize / 2), this.nameSize * (2 - 0.1 * name.length), this.drawNameSize * (2 - 0.1 * name.length))
                 uwu -= Math.max(this.s / 4.5, (this.nameSize * (2.55 - 0.08 * name.length)) / 1);
                 // drawText(ctx, false, this.x, uwu, this.nameSize / 2, this.drawNameSize / 2, 'zizi');
                 ctx.drawImage(image, owo, uwu, this.nameSize / 1, this.drawNameSize / 1);
             }
             drawText(ctx, false, this.x, this.y, this.nameSize * (2 - 0.1 * name.length), this.drawNameSize * (2 - 0.1 * name.length), name);
             // settings.showOldNames ? y += Math.max(this.s / 4.5, this.nameSize / 1.5) : 
             // y += Math.max(this.s / 4.5, (this.nameSize * (2 - 0.08 * this.name.length)) / 1.5);
             y += Math.max(this.s / 4.5, (this.nameSize * (2 - 0.08 * name.length)) / 1.5);
         }
         if (settings.showMass && (cells.mine.indexOf(this.id) !== -1 || cells.mine.length === 0) && this.viewRange > range && !settings.showEveryonesMass) {
             var mass;

             // settings.showOldNames ? mass = (~~(this.s * this.s / 100)).toString() : mass = (~~((this.s * this.s) / 100)).toString();
             // settings.showOldNames ? drawText(ctx, true, this.x, y, this.nameSize / 2, this.drawNameSize / 2, mass) : drawText(ctx, true, this.x, y, this.nameSize / 2, this.drawNameSize / 2, mass);
             this.s > 600 && settings.showPartyAutoResizeRings ? mass = (~~((this.s * this.s) / 101.5)).toString() : mass = (~~((this.s * this.s) / 100.15)).toString();
             // mass = displayShortMass(mass)
             let shortMass = numFormatter(mass);
             if (typeof shortMass === 'undefined') shortMass = mass;
             // drawText(ctx, true, this.x, y, this.nameSize / 2, this.drawNameSize / 2, mass);
             settings.showShortMass ? drawText(ctx, false, this.x, y, this.nameSize / 2, this.drawNameSize / 2, shortMass) : drawText(ctx, true, this.x, y, this.nameSize / 2, this.drawNameSize / 2, mass);
         } else if (settings.showEveryonesMass && settings.showMass && this.viewRange > range) {
             var mass;
             mass = (~~((this.s * this.s) / 100)).toString();
             let shortMass = numFormatter(mass);
             if (typeof shortMass === 'undefined') shortMass = mass;
             settings.showShortMass ? drawText(ctx, false, this.x, y, this.nameSize / 2, this.drawNameSize / 2, shortMass) : drawText(ctx, true, this.x, y, this.nameSize / 2, this.drawNameSize / 2, mass);
         }
         /* if (this.name && settings.showNames && this.viewRange > range && settings.showOldNames) {
             drawText(ctx, false, this.x, this.y, this.nameSize, this.drawNameSize, this.name);
             y += Math.max(this.s / 4.5, this.nameSize / 1.5);
         } 
         if (settings.showMass && (cells.mine.indexOf(this.id) !== -1 || cells.mine.length === 0) && this.viewRange > range && settings.showOldNames) {
             var mass = (~~(this.s * this.s / 100)).toString();
             drawText(ctx, true, this.x, y, this.nameSize / 2, this.drawNameSize / 2, mass);
         } */
     },
 };

const cells = Object.create({
     mine: [],
     byId: {},
     list: [],
 });

 const border = Object.create({
     left: -2000,
     right: 2000,
     top: -2000,
     bottom: 2000,
     width: 4000,
     height: 4000,
     centerX: -1,
     centerY: -1,
 });

 const leaderboard = Object.create({
     type: NaN,
     items: null,
     //canvas: document.createElement("canvas"),
     //teams: ["#F33", "#3F3", "#33F"],
 });

 const camera = {
     x: 0,
     y: 0,
     target: {
         x: 0,
         y: 0,
         scale: 1,
     },
     viewportScale: 1,
     userZoom: 1,
     sizeScale: 1,
     scale: 1,
 }

const servers = {
     arctida: {
          wss: "wss://imsolo.pro:2109",
          token: "aW1zb2xvLnBybzoyMTA5",
     },
     rookery: {
          wss: "wss://imsolo.pro:2104/",
          token: "aW1zb2xvLnBybzoyMTA0Lw==",
     },
};

const server_config = {
     imsolopro: {
          protocol: 22,
          client_version: 31107,
     },

};

class Client {
     constructor(type, server){

          this.type = type;
          this.server = server;
          this.socket = null;

          this.syncUpdStamp = Date.now();
          this.syncAppStamp = Date.now();

          this.connect(this.server);
     };

     connect(server){
          this.socket = new WebSocket(server);
          this.socket.binaryType = 'arraybuffer';
          this.socket.onmessage = this.onMessage.bind(this);
          this.socket.onerror = this.onError.bind(this);
          this.socket.onclose = this.onClose.bind(this);
          this.socket.onopen = this.onOpen.bind(this);
  
          jslogger.debug(`${this.type}`, `Connecting to ${server}`);
     };

     onOpen() {

        // Sending protocol version
        let protocol_version = this.createView(5);
        protocol_version.setUint8(0, 254);
        protocol_version.setUint32(1, server_config.imsolopro.protocol, true);
        this.sendBuffer(protocol_version);

        // Sending client version
        let client_version = this.createView(5);
        client_version.setUint8(0, 255);
        client_version.setUint32(1, server_config.imsolopro.client_version, true);
        this.sendBuffer(client_version);

       // Send ping
        clearInterval(this.pingLoop);
        this.pingLoop = setInterval( () => {
          this.sendBuffer(new Uint8Array([254]));
      }, 500);

      jslogger.success(`${this.type}`, `Connected ${this.server}`);
      toastr.success(`<b>[${this.type}]</b> Connected!`);

     };

     onClose() {
          jslogger.warning(`${this.type}`, `Disconnected ${this.server}`);
          toastr.warning(`<b>[${this.type}]</b> Disconnected!`);
          clearInterval(this.pingLoop);
     };
     onError() {

          jslogger.error(`${this.type}`, `Can't connect ${this.server}`);
          toastr.error(`<b>[${this.type}]</b> Failed to connect!`);
     };
     onMessage(data) {
          
          let reader = new DataView(data.data);
          let packetId = reader.getUint8();

           switch (packetId) {
               case 16: // Update nodes

               let killer, killed, id, node, x, y, s, flags, cell, updColor, updName, updSkin, updUuid, count, color, name, skin;

               // Consume records
               count = reader.getUint16();

                    for (var i = 0; i < count; i++) {

                    killer = reader.getUint32();
                    killed = reader.getUint32();

                    if (!cells.byId.hasOwnProperty(killer) || !cells.byId.hasOwnProperty(killed))
                         continue;
                         
                         cells.byId[killed].destroy(killer);

                    }

                    // update records
                    


                    break;
               case 17: // Update pos
                    break;
               case 18: // Clear all
                    this.flushCellsData();
                    break;
               case 20: // Clear my cells
                    break;
               case 21: // drasw line
                    jslogger.error(`${this.type}`, `got packet 21 (draw line) which is unsupported`);
                    break;
               case 32: // New cell  
                    break;
               case 48: // Text list
                    break;
               case 49: // FFA list
                    break;
               case 50: // Pie chart Teams
                    break;
               case 53:
                    //console.log(view);
                    break;
               case 64: // Set borders
                    break;
               case 254: // Server stats
                    break;
           }

     };
     isSocketOpen() {
          return this.socket !== null && this.socket.readyState === this.socket.OPEN;
     };
     createView(value) {
          return new DataView(new ArrayBuffer(value));
     };
     sendBuffer(data){
          this.socket.send(data.buffer);
     };

     flushCellsData() {

          this.isFreeSpectate = false
          this.isSpectateEnabled = false

          this.indexedCells = {};
          this.cells = [];
          this.playerCells = [];
          this.playerCellIDs = [];
          this.food = [];
          this.viruses = [];
     };
};