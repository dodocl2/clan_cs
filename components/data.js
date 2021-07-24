const DATA = (() => {
    let data = {
        values: {
            levels: (() => {
                // let list = [
                //     {id: 'R', point: 5.5},
                //     {id: 'S', point: 4},
                //     {id: 'A', point: 3},
                //     {id: 'B', point: 2},
                //     {id: 'C', point: 1.5},
                //     {id: 'D', point: 1},
                // ];
                // list.lowLevelsHandicap = -1;
                // list.highLevelsHandicap = 1;

                let list = [
                    {id: 'R', point: 10},
                    {id: 'S', point: 8},
                    {id: 'A', point: 7},
                    {id: 'B', point: 6},
                    {id: 'C', point: 4},
                    {id: 'D', point: 3},
                ];
                list.lowLevelsHandicap = -2;
                list.highLevelsHandicap = 1;


                list.lowLevels = list.slice(list.length-3).map(level => level.id);
                list.highLevels = list.slice(0, 2).map(level => level.id);

                list.pointIndex = list.reduce((data, level) => {
                    data[level.id] = level.point;
                    return data;
                },{});
                

                return list;
            })(),
            tribes: ['random', 'zerg', 'protoss', 'terran'],
        },
        indexObj: {
            members: {}
        },

        regMemberSrc: '',
        isRegMemberBNetChatSrc: false,
        members: [],
        selectedMembers: [],
        useObs: false,
        memberCntForTeam: 3,
        teamSize: 4,
        teams: [],
        obsTeam: [],
        obs_exceptNextTurnPercent: 90,
        lastDevideTeamsTime: null,
        changeTeamMember: {
            showWindow: false,
            teamNumber: null,
            member: null,
        },
        devideZerg: {
            use: false,
            percent: 100
        },
        teamBalance: {
            use: false,
            maxGap: 1
        },
        
        winningRate: {
            src: '',
            result: ''
        },
        
    }

    data.defaultLevel = data.values.levels[Math.floor(data.values.levels.length/2)];

    return data;
})();

export default DATA;