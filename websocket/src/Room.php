<?php

namespace Damian972\Websocket;

final class Room
{
    private string $identifier;

    private array $players = [];

    public function __construct(private readonly string $name, private int $maxPlayers = 4)
    {
        $this->identifier = uniqid();
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getMaxPlayers(): int
    {
        return $this->maxPlayers;
    }

    // public function addPlayer(Player $player): void
    // {
    //     $this->players[$player->getId()] = $player;
    // }
}
