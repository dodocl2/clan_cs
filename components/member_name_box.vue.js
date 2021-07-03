export default {
    template: `
    <div class="m-name inline-b"
        :data-tribe="member.tribe"
        :data-level="member.level"
    >
        <div class="member-attrs">
            <span class="member-attr-box"
                :data-level="member.level"
            >{{member.level}}</span>
            <span class="member-attr-box"
                v-if="member.tribe=='zerg'"
                :data-tribe="member.tribe"
            >Z</span>
        </div>
        <span>{{member.name}}</span>
    </div>
    `,
    props: ['member'],
    created() {
    },
    methods: {

    }
}