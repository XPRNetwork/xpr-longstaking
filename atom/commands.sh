cleospt push action longstaking addplan '{
        "oracle_index": "2",
        "plan_days": "1",
        "multiplier": "150",
        "is_stake_active": true,
        "is_claim_active": true
}' -p longstaking;

cleospt push action longstaking addplan '{
        "oracle_index": "2",
        "plan_days": "90",
        "multiplier": "105",
        "is_stake_active": true,
        "is_claim_active": true
}' -p longstaking;

cleospt push action longstaking addplan '{
        "oracle_index": "2",
        "plan_days": "365",
        "multiplier": "150",
        "is_stake_active": true,
        "is_claim_active": true
}' -p longstaking;

cleospt push action longstaking setplanstake '{
        "plan_index": "0",
        "is_stake_active": true
}' -p longstaking;

cleospt push action longstaking setplanclaim '{
        "plan_index": "0",
        "is_claim_active": true
}' -p longstaking;