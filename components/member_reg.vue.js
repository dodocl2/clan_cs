import Data from './data.js'
import MemberNameBox from './member_name_box.vue.js'

export default {
    template: `
    <div class="inline-g" style="float: left; width: 350px; ">
        <div class="bd01 inline-b" style="width: 100%;">
            <textarea style="width: 95%; height: 50px;"
                v-model="regMemberSrc"
            ></textarea>
            <button @click="regMembers">멤버 등록</button>
            <span>공백, 콤마, 엔터 구분</span>
            <label>
                <input type="checkbox"
                    v-model="isRegMemberBNetChatSrc"
                />
                <span>베넷채팅</span>
            </label>
        </div>
        <div class="align-r" style="margin-top: 10px;">
            <button @click="delAllMembers">전체삭제</button>
            <button @click="sortMembers">재정렬</button>
            <span>전체 : {{members.length}}명</span>
            <span>선택 : {{selectedMembers.length}}명</span>
        </div>
        <div class="reg-member-list bd01" style="width: 100%;">
            <div class="member"
                v-for="(member, i) in members"
                :class="{
                    bg1: i%2==0
                }"
            >
                <input type="checkbox"
                    :value="member"
                    v-model="selectedMembers"
                />
                <span class="m-no">{{i+1}}.</span>
                <member-name-box
                    :member="member"
                />

                <div class="m-levels inline-b">
                    <select
                        v-model="member.level"
                        :data-level="member.level"
                    >
                        <option v-for="level in values.levels"
                            :value="level.id"
                            :data-level="level.id"
                        >{{level.id}}</option>
                    </select>
                </div>

                <div class="m-tribes inline-b">
                    <select
                        v-model="member.tribe"
                        :data-tribe="member.tribe"
                    >
                        <option v-for="t in values.tribes"
                            :value="t"
                            :data-tribe="t"
                        >{{t}}</option>
                    </select>
                </div>
                <button class="inline" @click="delMembers(member.name)">삭제</button>
            </div>
        </div>
    </div>
    <!-- 
    <div class="inline-b" style="width: 200px; min-height: 300px;">
        <div class="bd01" style="width: 100%; min-height: 300px;">
            <div class="member"
                v-for="(member, i) in selectedMembers"
                :class="{
                    bg1: i%2==0
                }"
            >
                <span class="m-no">{{i+1}}.</span>
                <div class="m-name inline">{{member}}</div>
            </div>
        </div>
    </div>
    -->
    `,
    components: {
        MemberNameBox
    },
    // props: ['regMemberSrc', 'members', 'indexObj', 'selectedMembers', 'values', 'defaultLevel'],
    data() {
        return Data;
    },
    created() {
    },
    methods: {
        regMembers: function(){
            let list = [];
            if(this.isRegMemberBNetChatSrc){
                this.regMemberSrc.trim().split('\n').forEach(line => {
                    if(!line.startsWith('[')){
                        return;
                    }
                    line = line.substring(line.indexOf(']')+1).trim();
                    let idStr = line.substring(0, line.indexOf(':'));
                    list.push(idStr);
                });
            }else{
                this.regMemberSrc.trim().split(' ').forEach(a => {
                    a.split(',').forEach(b => {
                        b.split('\n').forEach(c => {
                            c = c.trim();
                            if(!c) return;
                            list.push(c);
                        })
                    })
                });
            }
            
            if(list.length === 0) return;
            console.log('reg src :', list.length, list);
            
            list.forEach(name => {
                let level = this.defaultLevel.id;

                try{
                    if(name.substring(1,2) === '`' && name.endsWith('[Cs]')){
                        level = name.substring(0,1);
                        name = name.substring(2, name.length-4);
                    }
                }catch(e){}

                if(this.members.find(m => m.name === name)){
                    return;
                }

                console.log('add :', name);

                let bMember = this.indexObj.members[name] = this.indexObj.members[name] || {
                    name,
                    tribe: 'random',
                    level
                };
                this.members.push(bMember);
            });

            this.sortMembers();
        },
        sortMembers: function(){
            this.members.sort((a,b) => {
                let gap = this.values.levels.pointIndex[b.level]
                                - this.values.levels.pointIndex[a.level];
                if(gap !== 0) return gap;
                return a.name.localeCompare(b.name);
            });
        },
        delAllMembers: function(){
            if(!confirm('전체삭제???')) return;
            this.members = [];
            this.selectedMembers = [];
        },
        delMembers: function(ms){
            if(!ms) return;
            if(typeof ms == 'string') ms = [ms];

            ms.forEach(name => {
                let idx = this.members.findIndex(m => m.name === name);
                if(idx > -1) this.members.splice(idx, 1);

                idx = this.selectedMembers.findIndex(m => m.name === name);
                if(idx > -1) this.selectedMembers.splice(idx, 1);
            });
        },

    }
}