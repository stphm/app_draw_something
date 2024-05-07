<?php

require 'vendor/autoload.php';

use OpenSwoole\WebSocket\Frame;
use OpenSwoole\WebSocket\Server;

$rooms = [
    'room1' => [
        'users' => [],
        '',
    ],
];
// https://rendu-git.etna-alternance.net/module-8870/activity-49211/group-974186/-/blob/main/src/Server/IrcServer.ts
$server = new Server('0.0.0.0', 9502);

$server->on('Start', function (Server $server) {
    echo "OpenSwoole WebSocket Server is started at http://127.0.0.1:9502\n";
});

$server->on('Open', function (Server $server, OpenSwoole\Http\Request $request) {
    echo "connection open: {$request->fd}\n";

    // $server->tick(1000, function () use ($server, $request) {
    //     $server->push($request->fd, json_encode(['hello', time()]));
    // });
});

$server->on('Message', function (Server $server, Frame $frame) {
    // echo "received message: {$frame->data}\n";
    /** @var array */
    $data = json_decode($frame->data, true, 512, JSON_THROW_ON_ERROR);

    if ('join_room' === $data['action']) {
        $rooms[$data['room']]['users'][] = $frame->fd;
    }

    // $server->push($frame->fd, json_encode(['hello', time()]));
});

$server->on('Close', function (Server $server, int $fd) {
    echo "connection close: {$fd}\n";
});

$server->start();
// $run->start();
