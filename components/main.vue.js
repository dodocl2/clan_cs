import {eventBus} from './eventBus.js'
import Data from './data.js'
import MemberReg from './member_reg.vue.js'
import MemberNameBox from './member_name_box.vue.js'

export default {
  template: `
<div id="main" style="display: none; width: 100%; height: 100%;">
    <member-reg
        :regMemberSrc="regMemberSrc"
        :members="members"
        :indexObj="indexObj"
        :selectedMembers="selectedMembers"
        :values="values"
        :defaultLevel="defaultLevel"
    />
    <div class="inline-g" style="width: 350px; min-height: 200px; margin-left: 20px;">
        <div class="bd01" style="width: 100%;">
            <div>
                <span>팀 수</span>
                <select v-model="teamSize">
                    <option v-for="n in 30">{{n}}</option>
                </select>
                <span>팀당 인원</span>
                <select v-model="memberCntForTeam">
                    <option v-for="n in 20">{{n}}</option>
                </select>
            </div>
            <div>
                <button @click="devideTeams">나누기 gogo</button>
                <button @click="copyTeamsText">베넷 채팅용 텍스트 복사</button>
            </div>
            <div style="margin-top: 5px">
                <input type="checkbox" id="devideZerg" v-model="devideZerg.use">
                <label for="devideZerg">
                    <span>각 팀 저그 배정. 확률 :</span>
                    <select v-model="devideZerg.percent">
                        <option
                            v-for="n in [100, 90, 80, 70, 60, 50, 40, 30, 20, 10]"
                            :value="n"
                        >{{n}}%</option>
                    </select>
                </label>
            </div>
            <div style="margin-top: 10px">
                <input type="checkbox" id="devideTeamBlance" v-model="teamBalance.use">
                <label for="devideTeamBlance">
                    <span>팀밸런스</span>
                    <span
                        v-for="(level, i) in values.levels"
                    >{{level.id}}:{{level.point}}{{i>0 && i+1!=values.levels.length ? ', ' : ' '}}</span>
                    <span>, S이상두명{{values.levels.highLevelsHandicap}}, B이하두명{{values.levels.lowLevelsHandicap}}</span>
                </label>
            </div>
            <div style="margin-top: 10px; font-size: 12px; color: red;"
                v-if="!!this.lastDevideTeamsTime"
            >
                마지막 나누기 : {{lastDevideTeamsTimeStr}}
            </div>
            <div class="team-setting-members" style="margin-top: 10px">
                <div style="margin-bottom: 6px;"
                    v-for="(team, i) in teams"
                >
                    <span>{{i+1}}팀({{ calcTeamLevelPoints(team) }}) : </span>
                    <member-name-box
                        v-for="member in team"
                        :key="member.name"
                        :member="member"
                        @click="showChangeTeamMemberWindow({team, member}, $event)"
                    />
                </div>
                <div
                    v-if="obsTeam.length > 0">
                    <span>옵저버({{obsTeam.length}}명) : </span>
                    <member-name-box
                        v-for="member in obsTeam"
                        :key="member.name"
                        :member="member"
                    />
                </div>
            </div>

            <dialog v-if="changeTeamMember.showWindow">
                
            </dialog>
        </div>
    </div>
    <!--
    <div class="inline-g" style="width: 350px; min-height: 150px; margin-left: 20px;">
        <div class="bd01" style="width: 100%;">
            <div>
                승률 계산. 좌측에 승 띄고 패 입력.<br>
                ex) |20 10 | 66.67%|
            </div>
            <div style="height: 100%;">
                <textarea style="width: 120px;height: calc(100% - 50px);margin: 0px;float: left;"
                    v-model="winningRate.src"
                ></textarea>
                <textarea readonly style="width: 80px;height: calc(100% - 50px);text-align: right;float: left;"
                    v-model="winningRate.result"
                ></textarea>
            </div>
        </div>
    </div>
    -->
</div>
  `,
    components: {
        MemberReg, MemberNameBox
    },
    data() {
        let data = Data;
        return data;
    },
    watch: (()=>{
        let obj = {
            // members: function(){
            //     this.calcTeamCount();
            //     this.saveAll();
            // },
            members: {
                deep: true,
                handler: function(){
                    this.members.forEach(member => {
                        this.indexObj.members[member.name] = member;
                    });

                    this.calcTeamCount();
                    this.saveAll();
                }
            },
            'winningRate.src': function(){
                this.calcWinningRate();
                this.saveAll();
            }
        };
        ['selectedMembers', 'regMemberSrc', 'teams', 'obsTeam'].forEach(t => {
            obj[t] = function(){
                this.saveAll();
            };
        })
        return obj;
    })(),
    computed: {
        lastDevideTeamsTimeStr: function(){
            if(!this.lastDevideTeamsTime) return '';
            let dt = new Date(this.lastDevideTeamsTime);

            function p(s){
                return (s>9 ? '' : '0') + s;
            }

            let mm = dt.getMonth() + 1;
            let dd = dt.getDate();
            let h = dt.getHours();
            let m = dt.getMinutes();
            let s = dt.getSeconds();

            return `${p(dt.getHours())}:${p(dt.getMinutes())}:${p(dt.getSeconds())}`;
        }
    },
    created() {
        this.loadAll();
    },
    mounted() {
        this.$el.style.display = '';
    },
    methods: {
        loadAll: function(){
            let str = localStorage.getItem('savedata');
            if(!str) return;
            let obj = JSON.parse(str);
            console.log('load data :', obj);

            // members
            (() => {
                
                obj.members && obj.members.forEach(m => {
                    m.tribe = m.tribe || 'random';
                    m.level = m.level || this.defaultLevel.id;
                });
            })();

            try{
                Object.assign(this, obj);
            }catch(e){
                console.error('load data error');
                localStorage.removeItem('savedata');
            }
        },
        saveAll: function(){
            clearTimeout(this._timer_savedata);
            setTimeout(() => {
                let obj = {};
                let except = ['values'];
                for(var k in this.$data){
                    if(except.includes(k)) continue;
                    obj[k] = this.$data[k];
                }
                localStorage.setItem('savedata', JSON.stringify(obj));
            }, 200);
        },

        calcTeamCount: function(){
            if(this.members.length === 0) return;
            let teamSize = Math.floor(this.members.length / this.memberCntForTeam);
            teamSize -= teamSize % 2;
            this.teamSize = teamSize;
        },
        sortTeam: function(team){
            let compare = (a,b) => {
                if(a.tribe === 'zerg'){
                    if(b.tribe === 'zerg'){
                        return this.values.levels.pointIndex[b.level]
                                - this.values.levels.pointIndex[a.level];
                    }
                    return -1;
                }else if(b.tribe === 'zerg'){
                    return 1;
                }
                return this.values.levels.pointIndex[b.level]
                                - this.values.levels.pointIndex[a.level];
            };
            team.sort(compare);
            return team;
        },
        devideTeams: function({devideOnly}){
            this.lastDevideTeamsTime = Date.now();

            let teams = new Array(parseInt(this.teamSize));
            let list = this.members.concat();
            // shuffle
            list = list.map((a) => [Math.random(),a]).sort((a,b) => a[0]-b[0]).map((a) => a[1]);
            
            // 저그 나누기
            if(this.devideZerg.use){
                let zergs = (() => {
                    let zergs = list.filter(m => m.tribe === 'zerg');
                    
                    while(zergs.length > teams.length){
                        let idx = parseInt(Math.random() * zergs.length);
                        zergs.splice(idx, 1);
                    }

                    return zergs;
                })();

                let teamNums = Array.from(Array(teams.length).keys())
                                .map((a) => [Math.random(),a]).sort((a,b) => a[0]-b[0]).map((a) => a[1]);

                for(let i=0; zergs.length>0 && i<teamNums.length; i++){
                    if(Math.random() * 100 > this.devideZerg.percent){
                        continue;
                    }

                    let tn = teamNums[i];
                    let team = teams[tn] = teams[tn] || [];

                    let member = zergs.pop();
                    team.push( member );

                    let idx = list.findIndex(m => m===member);
                    list.splice(idx, 1);
                }
            }

            // 팀 나누기
            let setTeams = () => {
                if(list.length == 0) return;
                let chk = false;
                for(let i=0; i<teams.length; i++){
                    let team = teams[i] = teams[i] || [];
                    
                    if(list.length > 0 && team.length < this.memberCntForTeam){
                        chk = true;
                        let idx = parseInt(Math.random() * list.length);
                        team.push( list[idx] );
                        list.splice(idx, 1);
                    }
                }
                if(!chk) return;
                setTeams();
            }
            setTeams();

            if(!devideOnly && this.teamBalance.use){
                let getGap = (ts) => {
                    // let sum = ts.reduce((sum, team) => {
                    //     team.points = this.calcTeamLevelPoints(team);
                    //     sum += team.points;
                    //     return sum;
                    // }, 0);
                    // ts.avg = sum / ts.length;
                    // ts.forEach(team => {
                    //     let gap = team.points - ts.avg;
                    //     ts.gap = Math.max(ts.gap || 0, gap);
                    // });
                    let list = ts.map(t => this.calcTeamLevelPoints(t));
                    ts.gap = Math.max.apply(null, list) - Math.min.apply(null, list);
                    return ts.gap;
                };

                // let list = [teams.concat()];
                // let balanceCreateSize = Math.max(10, teams.length * 10);
                // for(let i=0; i<balanceCreateSize; i++){
                //     let ts = this.devideTeams({devideOnly: true}).concat();
                //     getGap(ts);
                //     list.push(ts)
                // }
                // list.sort((a,b) => a.gap - b.gap);
                // teams = this.teams = list[0];
                let ts = teams;
                let tempTs = ts, tempObs = list;
                let loop = 0, loopLimit = 20000;
                while(getGap(ts) >= 1){
                    if(loop++ >= loopLimit){
                        console.warn('devide team - balance loop break :', loopLimit);
                        ts = tempTs;
                        list = tempObs;
                        break;
                    }
                    if(ts.gap < tempTs.gap){
                        tempTs = ts;
                        tempObs = list;
                    }
                    let dt = this.devideTeams({devideOnly: true});
                    ts = dt.teams;
                    list = dt.obsTeam;
                }
                console.log('devide team - loop count :', loop-1, new Date());
                teams = ts;
            }
            
            teams.forEach(team => this.sortTeam(team));
            let obsTeam = this.sortTeam(list);
            
            if(!devideOnly){
                this.teams = teams;
                this.obsTeam = obsTeam;
            }
            return {teams, obsTeam};
        },
        showChangeTeamMemberWindow: function({team, member}, e){
            let teams = this.teams.concat().filter(t => t !== team);
            let members = teams.reduce((arr, t) => {
                arr = arr.concat(t);
                return arr;
            }, []);
            members = this.obsTeam.concat(this.sortTeam(members));
            console.log('changeTeamMember :', members, e)
        },
        copyTeamsText: function(){
            let text = [];
            this.teams.forEach((team, i) => {
                let t = `${i+1}팀 : ${team.map(t=>t.name).join(', ')}`;
                text.push(t);
            });

            if(this.obsTeam.length > 0){
                text.push(`옵 : ${this.obsTeam.map(t=>t.name).join(', ')}`);
            }

            let tempElem = document.createElement('textarea');
            tempElem.value = text.join(' / ');
            document.body.appendChild(tempElem);

            tempElem.select();
            document.execCommand("copy");
            document.body.removeChild(tempElem);
        },
        getMemberPoints: function(member){
            let point = this.values.levels.pointIndex[member.level] || 0;
            // if(member.tribe === 'zerg'){
            //     point += 0.5;
            // }
            return point;
        },
        calcTeamLevelPoints: function(team){
            let highLevelCnt = 0, lowLevelCnt = 0;
            let points = team.reduce((sum, member) => {
                if(this.values.levels.lowLevels.includes(member.level)){
                    lowLevelCnt++;
                }else if(this.values.levels.highLevels.includes(member.level)){
                    highLevelCnt++;
                }

                let point = this.getMemberPoints(member);
                return sum + point;
            }, 0);

            if(lowLevelCnt >= 2){
                points += this.values.levels.lowLevelsHandicap;
            }
            if(highLevelCnt >= 2){
                points += this.values.levels.highLevelsHandicap;
            }
            return points;
        },
        calcWinningRate: function(){
            let rateList = [];
            this.winningRate.src.split('\n').forEach(line => {
                let point = [];
                line.trim().split(' ').forEach(str => {
                    if(point.length === 2) return;
                    
                    str = str.trim();
                    if(str.length === 0) return;
                    
                    try{
                        let v = eval(str);
                        v = parseFloat(v);
                        if(isNaN(v)) return;
                        
                        point.push(v);
                    }catch(e){
                        return;
                    }
                });
                if(point.length !== 2) return;
                
                console.log(point);
                rateList.push(
                    (point[0] / (point[0] + point[1]) * 100).toFixed(2)
                    + '%'
                );
            });

            this.winningRate.result = rateList.join('\n');
        }
    },

}
