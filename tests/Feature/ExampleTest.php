<?php

test('guests are redirected from the home page to login', function () {
    $this->get(route('home'))->assertRedirect(route('login'));
});
