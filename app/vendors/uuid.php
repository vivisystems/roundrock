<?php
class uuid {
    /**
     * This class enables you to get real uuids using the OSSP library.
     * Note you need php-uuid installed.
     * On my system 1000 UUIDs are created in 0.0064 seconds.
     *
     * @author Marius Karthaus
     *
     */

    protected $uuidobject;

    /**
     * On long running deamons i've seen a lost resource. This checks the resource and creates it if needed.
     *
     */
    protected function create() {
        if (! is_resource ( $this->uuidobject )) {
            uuid_create ( &$this->uuidobject );
        }
    }

    /**
     * Return a type 1 (MAC address and time based) uuid
     *
     * @return String
     */
    public function v1() {
        $this->create ();
        uuid_make ( $this->uuidobject, UUID_MAKE_V1 );
        uuid_export ( $this->uuidobject, UUID_FMT_STR, &$uuidstring );
        return trim ( $uuidstring );
    }

    /**
     * Return a type 4 (random) uuid
     *
     * @return String
     */
    public function v4() {
        $this->create ();
        uuid_make ( $this->uuidobject, UUID_MAKE_V4 );
        uuid_export ( $this->uuidobject, UUID_FMT_STR, &$uuidstring );
        return trim ( $uuidstring );
    }

    /**
     * Return a type 5 (SHA-1 hash) uuid
     *
     * @return String
     */
    public function v5() {
        $this->create ();
        uuid_make ( $this->uuidobject, UUID_MAKE_V5 );
        uuid_export ( $this->uuidobject, UUID_FMT_STR, &$uuidstring );
        return trim ( $uuidstring );
    }
}
?>