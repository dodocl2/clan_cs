const DATA = (() => {
    let data = {
        version: '1.0.0.1',
        removeOldVersionData: true,
        values: {
            levels: (() => {
                const levels = {};
                let list = levels.list = [
                    {id: 'R', point: 10},
                    {id: 'S', point: 9},
                    {id: 'A+', point: 8},
                    {id: 'A', point: 7},
                    {id: 'B+', point: 6.5},
                    {id: 'B', point: 6},
                    {id: 'C', point: 4},
                    {id: 'D', point: 3},
                ];
                levels.lowLevelsHandicap = -1;
                levels.highLevelsHandicap = 1;


                levels.lowLevels = list.slice(list.length-3).map(level => level.id);
                levels.highLevels = list.slice(0, 2).map(level => level.id);

                return levels;
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
        obs_exceptNextTurn: true,
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

    data.defaultLevel = data.values.levels.list[Math.floor(data.values.levels.list.length/2)];

    return data;
})();

export default DATA;