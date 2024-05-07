<?php

namespace Damian972\Websocket\Message;

final class Action
{
    public function __construct(private readonly string $type, private readonly null|string|array $payload)
    {
    }

    public function getType(): string
    {
        return $this->type;
    }

    public function getPayload(): null|string|array
    {
        return $this->payload;
    }
}
