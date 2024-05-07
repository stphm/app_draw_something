<?php

namespace Damian972\Websocket\Message\Handler;

final class JoinRoomHandler
{
    public function handle()
    {
    }

    public function supports(string $action): bool
    {
        return 'join_room' === $action;
    }
}
