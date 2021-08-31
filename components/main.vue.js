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
    <div class="inline-g" style="width: 400px; min-height: 200px;">
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
                <button @click.alt.prevent="devideTeams2" @click="devideTeams({event: $event})">나누기 gogo</button>
                <button @click="copyTeamsText">베넷 채팅용 텍스트 복사</button>
            </div>
            <div style="margin-top: 5px; font-size: 12px;">
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
            <div style="margin-top: 0px; font-size: 12px;">
                <input type="checkbox" id="devideTeamBlance" v-model="teamBalance.use">
                <label for="devideTeamBlance">
                    <span>팀밸런스</span>
                    <div style="display: inline-block; margin-right: 2px;"
                        v-for="(level, i) in values.levels.list"
                    >
                        <span>{{level.id}}:</span><select class="simple" v-model="level.point">
                            <option
                                v-for="n in [10, 9.5, 9, 8.5, 8, 7.5, 7, 6.5, 6, 5.5, 5, 4.5, 4, 3.5, 3, 2, 1]"
                                :value="n"
                            >{{n}}</option>
                        </select>&nbsp;
                        <!-- <span>{{i+1!=values.levels.list.length ? ', ' : ' '}}</span> -->
                    </div>
                    <div style="margin-left: 24px;">
                        <span>S이상두명+</span>
                        <select class="simple" v-model="values.levels.highLevelsHandicap">
                            <option
                                v-for="n in [1,2,3,4,5,6,7,8,9,10]"
                                :value="n"
                            >{{n}}</option>
                        </select>
                        <span>B이하두명</span>
                        <select class="simple" v-model="values.levels.lowLevelsHandicap">
                            <option
                                v-for="n in [-1,-2,-3,-4,-5,-6,-7,-8,-9,-10]"
                                :value="n"
                            >{{n}}</option>
                        </select>
                        <span>최대격차</span>
                        <select class="simple" v-model="teamBalance.maxGap">
                            <option
                                v-for="n in [1,2,3,4,5,6,7,8,9,10]"
                                :value="n"
                            >{{n}}</option>
                        </select>
                    </div>
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
                    <span>{{i+1}}팀({{ team.points===undefined ? calcTeamLevelPoints(team) : team.points }}) : </span>
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
                    <div style="font-size: 12px;">
                        <label>
                            <input type="checkbox" v-model="obs_exceptNextTurn">
                            <span>다음 나누기에 {{obs_exceptNextTurnPercent}}% 확률로 옵에서 제외</span>
                        </label>
                    </div>
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
        window._data = data;
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
            'values.levels': {
                deep: true,
                handler: function(){
                    if(!this._created) return;

                    this.createLevelsIndex();
                    this.teams.forEach((team, i) => {
                        let old = team.points;
                        let points = this.calcTeamLevelPoints(team);
                        if(old !== points){
                            this.teams.splice(i, 1, team.concat());
                        }
                    });
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
        // compare version
        (() => {
            if(!this.removeOldVersionData) return;

            let data = this.getSavedData();
            if(!data) return;
            if(data.version === this.version){
                return;
            }
            
            let oldVerArr = data.version ? data.version.split('.') : [];
            let verArr = this.version.split('.');
            let remove = false;
            if(oldVerArr.length === verArr.length){
                for(let i=0; i<oldVerArr.length; i++){
                    if(parseInt(oldVerArr[i]) < parseInt(verArr[i])){
                        remove = true;
                        break;
                    }
                }
            }else{
                remove = true;
            }
            
            if(remove){
                console.log('remove save data :', data.version, this.version);
                localStorage.removeItem('savedata');
            }
        })();

        this.createLevelsIndex();

        try{
            this.loadAll();
        }catch(e){
            console.error('load data error', e);
        }

        this.$nextTick(() => {
            this._created = true;
        });
    },
    mounted() {
        this.$el.style.display = '';
    },
    methods: {
        loadAll: function(){
            let obj = this.getSavedData();
            if(!obj) return;
            console.log('load data :', obj);

            ['teams', 'obsTeam'].forEach(name => {
                if(obj[name].findIndex(t => t == null) > -1){
                    delete obj[name];
                }
            });

            // members
            (() => {
                obj.members && obj.members.forEach(m => {
                    m.tribe = m.tribe || 'random';
                    m.level = m.level || this.defaultLevel.id;
                });
            })();

            try{
                // Object.assign(this, obj);
                _.mergeWith(this, obj);
                for(let key in obj){
                    let value = this[key];
                    if(value === undefined || value === null) continue;
                    if(typeof value !== 'object') continue;
                    value = _.mergeWith(Array.isArray(value) ? [] : {}, value, obj[key]);

                    this.$set(this, key, value);
                }
            }catch(e){
                console.error('load data error', e);
                localStorage.removeItem('savedata');
            }
        },
        getSavedData: function(){
            try{
                let str = localStorage.getItem('savedata');
                if(!str) return;
                let obj = JSON.parse(str);
                return obj;
            }catch(e){
                return null;
            }
        },
        saveAll: function(){
            clearTimeout(this._timer_savedata);
            setTimeout(() => {
                let obj = {};
                let except = [];//['values'];
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
                        return this.values.levelPointIndex[b.level]
                                - this.values.levelPointIndex[a.level];
                    }
                    return -1;
                }else if(b.tribe === 'zerg'){
                    return 1;
                }
                let s = this.values.levelPointIndex[b.level]
                                - this.values.levelPointIndex[a.level];
                if(s === 0){
                    return a.name.localeCompare(b.name);
                }
                return s;
            };
            team.sort(compare);
            return team;
        },
        devideTeams2: function({}){
            console.log('# devideTeams2');
            if(this.members.length === 0){
                return {teams: [], obsTeam: []};
            }

            let renew = false;
            if(Date.now() - this.lastDevideTeamsTime || 0 > 60000*5){
                renew = true;
            }
            this.lastDevideTeamsTime = Date.now();

            this.teamSize = parseInt(this.teamSize);
            let obsMemberCount = this.members.length - (this.teamSize * this.memberCntForTeam);
            let obsTeam = [];
            let list = this.members.concat();
            
            // shuffle
            list = list.map((a) => [Math.random(),a]).sort((a,b) => a[0]-b[0]).map((a) => a[1]);
            
            // 옵저버 미리 생성
            if(obsMemberCount > 0){
                obsTeam = list.splice(0, obsMemberCount);
                if(this.obs_exceptNextTurn && !renew && this.obsTeam){
                    obsTeam.forEach((obs, i) => {
                        let prevObs = this.obsTeam.find(prev => prev.name == obs.name);
                        if(!prevObs) return;
                        if(Math.random() * 100 > this.obs_exceptNextTurnPercent){
                            return;
                        }
                        obsTeam.splice(i, 1);
                        obsTeam.push(list.shift());
                        list.push(obs);
                    })
                }
            }

            const getCombinations = function(arr, selectCnt){
                let results = [];
                if (selectCnt === 1) return arr.map(value => [value]);

                arr.forEach((item, index, origin) => {
                    const rest = origin.slice(index + 1);
                    getCombinations(rest, selectCnt - 1).forEach(comb => {
                        comb.push( item );
                        results.push( comb );
                    });
                });

                return results;
            }

            // console.log('######################################## st')
            // member combination
            const member_comb = (() => {
                let member_comb = getCombinations(list, 3);
                member_comb.forEach(team => {
                    this.sortTeam(team);
                    this.calcTeamLevelPoints(team)
                    // console.log( team.map(m => m.name).join(',') + ' : ' + team.points )
                });
                member_comb.sort((a,b) => b.points-a.points);
                // member_comb = member_comb.slice(0, 100);
                return member_comb;
            })();
            // console.log('######################################## ed')

            // team combination
            const team_comb = (() => {
                let teams_comb = [];
                member_comb.forEach((team, index, ori) => {
                    const mark = (team, selected) => {
                        team.forEach(member => {
                            selected[member.name] = true;
                        });
                    }
                    const isMarked = (team, selected) => {
                        return team.find(member => {
                            return selected[member.name] === true
                        });
                    }
                    
                    const srcList = ori.slice(0, index).concat(ori.slice(index+1));
                    for(let i=0; i<srcList.length; i++){
                        const results = [team];
                        const selected = {};
                        mark(team, selected);
                        srcList.forEach(srcTeam => {
                            if(!isMarked(srcTeam, selected)){
                                results.push(srcTeam);
                                mark(srcTeam, selected);
                            }
                        });
                        srcList.push( srcList.shift() );

                        results.gap = (() => {
                            let list = results.map(t => t.points);
                            return Math.max.apply(null, list) - Math.min.apply(null, list);
                        })();
                        teams_comb.push(results);
                    }
                })

                let dupChk = {};
                teams_comb = teams_comb.filter((ts, i) => {
                    function g(team){
                        if(!team.name){
                            team.name = team.map(m => m.name).join(',');
                        }
                        return team.name;
                    }
                    ts.sort((a,b) => g(a).localeCompare(g(b)));
                    g(ts);
                    
                    if(dupChk[ts.name] === true){
                        return false;
                    }else{
                        dupChk[ts.name] = true;
                        return true;
                    }
                })

                teams_comb.sort((a,b) => a.gap-b.gap);
                let maxGap = Math.max((this.teamBalance.maxGap || 1), teams_comb[0].gap);
                let last_teams_comb = teams_comb.filter(teams => teams.gap <= maxGap);
                
                console.log('## team comb : maxGap[%d], len[%d]',
                    maxGap, last_teams_comb.length, last_teams_comb)
                last_teams_comb = last_teams_comb.slice(0, 1000)
                return last_teams_comb;
            })();

            let selected_teams = team_comb[ parseInt(Math.random() * team_comb.length) ];
            this.teams = selected_teams;
            this.obsTeam = obsTeam;
        },
        devideTeams: function({event, devideOnly}){
            if(event && event.altKey){
                return;
            }
            if(!devideOnly){
                console.log('# devideTeams');
            }
            
            if(this.members.length === 0){
                return {teams: [], obsTeam: []};
            }

            let renew = false;
            if(Date.now() - this.lastDevideTeamsTime || 0 > 60000*5){
                renew = true;
            }
            this.lastDevideTeamsTime = Date.now();

            let teams = new Array(parseInt(this.teamSize));
            let obsMemberCount = this.members.length - (teams.length * this.memberCntForTeam);
            let obsTeam = [];
            let list = this.members.concat();

            // shuffle
            list = list.map((a) => [Math.random(),a]).sort((a,b) => a[0]-b[0]).map((a) => a[1]);

            // 옵저버 미리 생성
            if(obsMemberCount > 0){
                obsTeam = list.splice(0, obsMemberCount);
                if(this.obs_exceptNextTurn && !renew && this.obsTeam){
                    obsTeam.forEach((obs, i) => {
                        let prevObs = this.obsTeam.find(prev => prev.name == obs.name);
                        if(!prevObs) return;
                        if(Math.random() * 100 > this.obs_exceptNextTurnPercent){
                            return;
                        }
                        obsTeam.splice(i, 1);
                        obsTeam.push(list.shift());
                        list.push(obs);
                    })
                }
            }
            
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

            // 팀 밸런스
            (() => {
                if(devideOnly || !this.teamBalance.use){
                    return;
                }

                let getGap = (ts) => {
                    let list = ts.map(t => this.calcTeamLevelPoints(t));
                    ts.gap = Math.max.apply(null, list) - Math.min.apply(null, list);
                    return ts.gap;
                };

                let ts, tObs, gap;
                let minObj;
                let target_teams = [];
                let loop = 0, loopMin = 3000, loopMax = 20000;

                do{
                    if(!ts){
                        ts = teams;
                        tObs = obsTeam;
                    }else{
                        let dt = this.devideTeams({devideOnly: true});
                        ts = dt.teams;
                        tObs = dt.obsTeam;
                    }

                    gap = getGap(ts);
                    if(gap <= (this.teamBalance.maxGap || 1)){
                        target_teams.push({ts, tObs, gap});
                    }else if(!minObj || gap < minObj.gap){
                        minObj = {ts, tObs, gap};
                    }

                    loop++;
                    if(loop >= loopMax){
                        console.warn('devide team - balance max loop break :', loopMax);
                        target_teams.push(minObj);
                        break;
                    }
                }while(loop < loopMin || target_teams.length===0);

                let selected = target_teams[ parseInt(Math.random() * target_teams.length) ];
                teams = selected.ts;
                obsTeam = selected.tObs;
                
                console.log('devide team - loop[%d], gap[%d], target :',
                    loop, selected.gap,
                    target_teams.length, target_teams);
            })();
            
            teams.forEach(team => this.sortTeam(team));
            obsTeam = this.sortTeam(obsTeam);
            
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
                let t = `${i+1}팀${team.points !== undefined ? '('+team.points+')' : ''}: ${team.map(t=>t.name).join(', ')}`;
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
        createLevelsIndex: function(){
            this.values.levelPointIndex = this.values.levels.list.reduce((data, level) => {
                data[level.id] = parseFloat(level.point);
                return data;
            },{});
        },
        getMemberPoints: function(member){
            let point = this.values.levelPointIndex[member.level] || 0;
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

            team.points = points;
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
